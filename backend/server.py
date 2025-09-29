from fastapi import FastAPI, APIRouter, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, validator, model_validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date, timedelta
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import uuid
from enum import Enum
import random

# Load environment variables
load_dotenv()

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'yyzflights_db')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# Create FastAPI app
app = FastAPI(
    title="YYZ Flights API",
    description="Toronto Flight Booking API with TravelPayouts Integration",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API Router
api_router = APIRouter(prefix="/api")

# Enums and Models
class CurrencyCode(str, Enum):
    USD = "USD"
    CAD = "CAD"
    EUR = "EUR"
    GBP = "GBP"

class TripClass(str, Enum):
    ECONOMY = "Y"
    BUSINESS = "C" 
    FIRST = "F"

class FlightSearchRequest(BaseModel):
    origin: str = Field(..., description="IATA code for departure city")
    destination: str = Field(..., description="IATA code for destination city")
    departure_date: date = Field(..., description="Departure date")
    return_date: Optional[date] = Field(None, description="Return date for round-trip")
    adults: int = Field(1, ge=1, le=9, description="Number of adult passengers")
    children: int = Field(0, ge=0, le=8, description="Number of child passengers")
    infants: int = Field(0, ge=0, le=2, description="Number of infant passengers")
    currency: CurrencyCode = Field(CurrencyCode.CAD, description="Preferred currency")
    trip_class: TripClass = Field(TripClass.ECONOMY, description="Flight class")
    direct_flights_only: bool = Field(False, description="Show only direct flights")
    
    @validator('origin', 'destination')
    def validate_iata_codes(cls, v):
        if not v or len(v) != 3 or not v.isalpha():
            raise ValueError('IATA code must be 3 letters')
        return v.upper()
    
    @validator('departure_date')
    def validate_departure_date(cls, v):
        if v < date.today():
            raise ValueError('Departure date cannot be in the past')
        if v > date.today() + timedelta(days=365):
            raise ValueError('Departure date cannot be more than 365 days in the future')
        return v
    
    @root_validator
    def validate_return_date(cls, values):
        departure_date = values.get('departure_date')
        return_date = values.get('return_date')
        
        if return_date and departure_date:
            if return_date <= departure_date:
                raise ValueError('Return date must be after departure date')
        return values

class FlightSegment(BaseModel):
    origin: str
    destination: str 
    departure_at: datetime
    arrival_at: datetime
    airline: str
    flight_number: str
    aircraft: Optional[str] = None
    duration_minutes: int

class FlightOption(BaseModel):
    price: float
    currency: str
    segments: List[FlightSegment]
    total_duration_minutes: int
    stops: int
    booking_url: str
    airline_name: Optional[str] = None
    
class FlightSearchResult(BaseModel):
    flights: List[FlightOption]
    total_results: int
    currency: str
    search_completed: bool = True

class PopularDestination(BaseModel):
    destination: str
    city_name: str
    country: str
    price: float
    currency: str
    airline: str
    image_url: Optional[str] = None

class FlightStatus(BaseModel):
    flight_number: str
    airline: str
    status: str
    departure_airport: str
    arrival_airport: str
    scheduled_departure: datetime
    scheduled_arrival: datetime
    actual_departure: Optional[datetime] = None
    actual_arrival: Optional[datetime] = None
    gate: Optional[str] = None
    terminal: Optional[str] = None

class APIResponse(BaseModel):
    success: bool
    data: Any = None
    message: str = ""
    errors: Optional[List[str]] = None

# Mock data for development
AIRLINES = {
    "AC": "Air Canada",
    "WS": "WestJet",
    "TS": "Air Transat",
    "PD": "Porter Airlines",
    "AA": "American Airlines",
    "UA": "United Airlines",
    "DL": "Delta Air Lines",
    "BA": "British Airways",
    "LH": "Lufthansa",
    "AF": "Air France"
}

CITIES = {
    "YYZ": {"name": "Toronto", "country": "Canada"},
    "YVR": {"name": "Vancouver", "country": "Canada"},
    "YUL": {"name": "Montreal", "country": "Canada"}, 
    "LAX": {"name": "Los Angeles", "country": "United States"},
    "JFK": {"name": "New York", "country": "United States"},
    "LHR": {"name": "London", "country": "United Kingdom"},
    "CDG": {"name": "Paris", "country": "France"},
    "FCO": {"name": "Rome", "country": "Italy"},
    "NRT": {"name": "Tokyo", "country": "Japan"},
    "SYD": {"name": "Sydney", "country": "Australia"},
    "MIA": {"name": "Miami", "country": "United States"},
    "DXB": {"name": "Dubai", "country": "United Arab Emirates"}
}

def generate_mock_flights(origin: str, destination: str, departure_date: date, return_date: Optional[date], currency: str) -> List[FlightOption]:
    """Generate realistic mock flight data"""
    flights = []
    base_prices = {
        "domestic": {"CAD": (200, 800), "USD": (150, 600)},
        "international": {"CAD": (600, 2500), "USD": (450, 1900)}
    }
    
    # Determine if domestic or international
    origin_country = CITIES.get(origin, {}).get("country", "")
    dest_country = CITIES.get(destination, {}).get("country", "")
    flight_type = "domestic" if origin_country == dest_country == "Canada" else "international"
    
    price_range = base_prices[flight_type][currency]
    
    # Generate 3-8 flight options
    num_flights = random.randint(3, 8)
    
    for i in range(num_flights):
        airline_code = random.choice(list(AIRLINES.keys()))
        airline_name = AIRLINES[airline_code]
        
        # Generate departure time
        departure_hour = random.randint(6, 22)
        departure_time = datetime.combine(departure_date, datetime.min.time().replace(hour=departure_hour, minute=random.randint(0, 59)))
        
        # Calculate flight duration (realistic based on distance)
        if flight_type == "domestic":
            duration_minutes = random.randint(90, 360)  # 1.5 to 6 hours
        else:
            duration_minutes = random.randint(360, 900)  # 6 to 15 hours
            
        arrival_time = departure_time + timedelta(minutes=duration_minutes)
        
        # Generate price with some variation
        base_price = random.uniform(price_range[0], price_range[1])
        price = round(base_price * (1 + random.uniform(-0.2, 0.3)), 2)
        
        # Create flight segment
        segment = FlightSegment(
            origin=origin,
            destination=destination,
            departure_at=departure_time,
            arrival_at=arrival_time,
            airline=airline_code,
            flight_number=f"{airline_code}{random.randint(100, 9999)}",
            aircraft=random.choice(["Boeing 737", "Airbus A320", "Boeing 777", "Airbus A350"]),
            duration_minutes=duration_minutes
        )
        
        # Generate booking URL
        booking_url = f"https://www.aviasales.com/search/{origin}{destination}{departure_date.strftime('%d%m%y')}?marker=yyzflights"
        
        flight = FlightOption(
            price=price,
            currency=currency,
            segments=[segment],
            total_duration_minutes=duration_minutes,
            stops=0,
            booking_url=booking_url,
            airline_name=airline_name
        )
        
        flights.append(flight)
    
    # Sort by price
    flights.sort(key=lambda f: f.price)
    return flights

# API Endpoints
@api_router.get("/")
async def root():
    return {"message": "YYZ Flights API - Toronto's Premier Flight Booking Platform"}

@api_router.post("/flights/search", response_model=APIResponse)
async def search_flights(search_request: FlightSearchRequest):
    """Search for flights with mock TravelPayouts data"""
    try:
        # Generate mock flight data
        flights = generate_mock_flights(
            search_request.origin,
            search_request.destination, 
            search_request.departure_date,
            search_request.return_date,
            search_request.currency.value
        )
        
        result = FlightSearchResult(
            flights=flights,
            total_results=len(flights),
            currency=search_request.currency.value,
            search_completed=True
        )
        
        return APIResponse(
            success=True,
            data=result.dict(),
            message=f"Found {len(flights)} flight options"
        )
        
    except Exception as e:
        logging.error(f"Flight search error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/flights/destinations/popular", response_model=APIResponse)
async def get_popular_destinations(origin: str = Query("YYZ", description="Origin airport code")):
    """Get popular destinations from Toronto"""
    
    # Mock popular destinations from Toronto
    destinations = [
        PopularDestination(
            destination="LHR",
            city_name="London", 
            country="United Kingdom",
            price=850.00,
            currency="CAD",
            airline="AC",
            image_url="https://images.unsplash.com/photo-1513635269975-59663e0ac1ad"
        ),
        PopularDestination(
            destination="CDG",
            city_name="Paris",
            country="France", 
            price=920.00,
            currency="CAD",
            airline="AC",
            image_url="https://images.unsplash.com/photo-1502602898536-47ad22581b52"
        ),
        PopularDestination(
            destination="LAX", 
            city_name="Los Angeles",
            country="United States",
            price=450.00,
            currency="CAD",
            airline="AC",
            image_url="https://images.unsplash.com/photo-1581833971358-2c8b550f87b3"
        ),
        PopularDestination(
            destination="NRT",
            city_name="Tokyo",
            country="Japan",
            price=1200.00,
            currency="CAD",
            airline="AC",
            image_url="https://images.unsplash.com/photo-1540959733332-eab4deabeeaf"
        ),
        PopularDestination(
            destination="YVR",
            city_name="Vancouver",
            country="Canada",
            price=280.00,
            currency="CAD",
            airline="AC",
            image_url="https://images.unsplash.com/photo-1549940344-ca0ace547de5"
        ),
        PopularDestination(
            destination="JFK",
            city_name="New York",
            country="United States",
            price=380.00,
            currency="CAD",
            airline="AC",
            image_url="https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9"
        )
    ]
    
    return APIResponse(
        success=True,
        data=destinations,
        message=f"Retrieved {len(destinations)} popular destinations"
    )

@api_router.get("/flights/status", response_model=APIResponse)
async def get_flight_status(flight_number: str = Query(..., description="Flight number (e.g., AC123)")):
    """Get flight status information"""
    
    # Extract airline code and number
    airline_code = flight_number[:2].upper()
    flight_num = flight_number[2:]
    
    if airline_code not in AIRLINES:
        raise HTTPException(status_code=404, detail="Flight not found")
    
    # Generate mock flight status
    now = datetime.now()
    scheduled_departure = now + timedelta(hours=random.randint(1, 8))
    scheduled_arrival = scheduled_departure + timedelta(hours=random.randint(2, 12))
    
    statuses = ["On Time", "Delayed", "Boarding", "Departed", "Arrived", "Cancelled"]
    status = random.choice(statuses)
    
    flight_status = FlightStatus(
        flight_number=flight_number.upper(),
        airline=AIRLINES[airline_code],
        status=status,
        departure_airport="YYZ",
        arrival_airport=random.choice(["LAX", "JFK", "LHR", "CDG"]),
        scheduled_departure=scheduled_departure,
        scheduled_arrival=scheduled_arrival,
        actual_departure=scheduled_departure + timedelta(minutes=random.randint(-30, 60)) if status in ["Departed", "Arrived"] else None,
        actual_arrival=scheduled_arrival + timedelta(minutes=random.randint(-30, 60)) if status == "Arrived" else None,
        gate=f"B{random.randint(1, 30)}",
        terminal=random.choice(["1", "3"])
    )
    
    return APIResponse(
        success=True,
        data=flight_status.dict(),
        message=f"Flight status for {flight_number.upper()}"
    )

@api_router.get("/health")
async def health_check():
    """Health check endpoint"""
    return APIResponse(
        success=True,
        message="YYZ Flights API is healthy",
        data={"status": "healthy", "timestamp": datetime.now().isoformat()}
    )

# Include router
app.include_router(api_router)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)