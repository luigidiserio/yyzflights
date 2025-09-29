import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { Loader2, Plane, Clock, MapPin, Star, Search, Calendar as CalendarIcon } from 'lucide-react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Main App Component
function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

// Home Page Component
function HomePage() {
  const [activeTab, setActiveTab] = useState('search');
  const [searchResults, setSearchResults] = useState(null);
  const [popularDestinations, setPopularDestinations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [flightStatus, setFlightStatus] = useState(null);
  
  // Search form state
  const [searchForm, setSearchForm] = useState({
    origin: 'YYZ',
    destination: '',
    departureDate: null,
    returnDate: null,
    adults: 1,
    children: 0,
    tripType: 'round-trip'
  });
  
  const [statusForm, setStatusForm] = useState({ flightNumber: '' });

  // Load popular destinations on mount
  useEffect(() => {
    loadPopularDestinations();
  }, []);

  const loadPopularDestinations = async () => {
    try {
      const response = await axios.get(`${API}/flights/destinations/popular?origin=YYZ`);
      if (response.data.success) {
        setPopularDestinations(response.data.data);
      }
    } catch (error) {
      console.error('Error loading popular destinations:', error);
    }
  };

  const handleFlightSearch = async (e) => {
    e.preventDefault();
    if (!searchForm.destination || !searchForm.departureDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    
    try {
      // Build TravelPayouts search URL parameters
      const searchParams = new URLSearchParams({
        origin_iata: searchForm.origin,
        destination_iata: searchForm.destination,
        departure_at: searchForm.departureDate.toISOString().split('T')[0],
        adults: searchForm.adults.toString(),
        children: searchForm.children.toString(),
        infants: '0',
        trip_class: 'Y', // Economy
        marker: 'yyzflights'
      });

      // Add return date if it's a round trip
      if (searchForm.returnDate) {
        searchParams.append('return_at', searchForm.returnDate.toISOString().split('T')[0]);
      }

      // Redirect to your TravelPayouts white-label search
      const searchUrl = `https://search.yyzflights.com/?${searchParams.toString()}`;
      
      toast.success('Redirecting to flight search...');
      
      // Open in new tab to maintain the main site
      window.open(searchUrl, '_blank');
      
    } catch (error) {
      console.error('Flight search error:', error);
      toast.error('Error preparing flight search. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusCheck = async (e) => {
    e.preventDefault();
    if (!statusForm.flightNumber) {
      toast.error('Please enter a flight number');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`${API}/flights/status?flight_number=${statusForm.flightNumber}`);
      if (response.data.success) {
        setFlightStatus(response.data.data);
        toast.success('Flight status retrieved!');
      }
    } catch (error) {
      console.error('Flight status error:', error);
      toast.error('Flight not found. Please check the flight number.');
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-CA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-CA', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-red-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b-2 border-red-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Plane className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-red-600 via-blue-600 to-red-600 bg-clip-text text-transparent">
                  YYZ Flights
                </h1>
                <p className="text-sm text-gray-600">Toronto's Premier Flight Booking</p>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <span className="text-sm text-gray-600">🍁 Proudly Canadian</span>
              <Badge variant="outline" className="border-red-500 text-red-600">
                TravelPayouts Partner
              </Badge>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section 
        className="relative h-96 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url('https://images.unsplash.com/photo-1559869824-929df9dab35e?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1ODB8MHwxfHNlYXJjaHwyfHxUb3JvbnRvJTIwc2t5bGluZXxlbnwwfHx8fDE3NTkxNTY4MDJ8MA&ixlib=rb-4.1.0&q=85')`
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h2 className="text-5xl font-bold mb-4">Fly from Toronto to the World</h2>
            <p className="text-xl mb-6">Discover amazing deals on flights departing from YYZ</p>
            <div className="flex items-center justify-center space-x-2 text-lg">
              <MapPin className="w-5 h-5" />
              <span>Toronto Pearson International Airport (YYZ)</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="search" className="data-[state=active]:bg-red-500 data-[state=active]:text-white">
              <Search className="w-4 h-4 mr-2" />
              Search Flights
            </TabsTrigger>
            <TabsTrigger value="status" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Clock className="w-4 h-4 mr-2" />
              Flight Status
            </TabsTrigger>
          </TabsList>

          {/* Flight Search Tab */}
          <TabsContent value="search" className="space-y-8">
            <Card className="shadow-lg border-t-4 border-t-red-500">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Search className="w-6 h-6 mr-2 text-red-500" />
                  Find Your Perfect Flight
                </CardTitle>
                <CardDescription>
                  Search for flights from Toronto and get redirected to our TravelPayouts booking platform for the best deals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleFlightSearch} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Origin */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">From</label>
                      <Select
                        value={searchForm.origin}
                        onValueChange={(value) => setSearchForm({...searchForm, origin: value})}
                      >
                        <SelectTrigger data-testid="origin-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="YYZ">YYZ - Toronto, Canada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Destination */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">To</label>
                      <Select
                        value={searchForm.destination}
                        onValueChange={(value) => setSearchForm({...searchForm, destination: value})}
                      >
                        <SelectTrigger data-testid="destination-select">
                          <SelectValue placeholder="Select destination" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LAX">LAX - Los Angeles, USA</SelectItem>
                          <SelectItem value="JFK">JFK - New York, USA</SelectItem>
                          <SelectItem value="LHR">LHR - London, UK</SelectItem>
                          <SelectItem value="CDG">CDG - Paris, France</SelectItem>
                          <SelectItem value="NRT">NRT - Tokyo, Japan</SelectItem>
                          <SelectItem value="YVR">YVR - Vancouver, Canada</SelectItem>
                          <SelectItem value="MIA">MIA - Miami, USA</SelectItem>
                          <SelectItem value="FCO">FCO - Rome, Italy</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Departure Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Departure Date</label>
                      <div className="relative">
                        <Input
                          type="date"
                          min={new Date().toISOString().split('T')[0]}
                          value={searchForm.departureDate ? searchForm.departureDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => setSearchForm({...searchForm, departureDate: new Date(e.target.value)})}
                          className="pl-10"
                          data-testid="departure-date"
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Return Date */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Return Date (Optional)</label>
                      <div className="relative">
                        <Input
                          type="date"
                          min={searchForm.departureDate ? searchForm.departureDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                          value={searchForm.returnDate ? searchForm.returnDate.toISOString().split('T')[0] : ''}
                          onChange={(e) => setSearchForm({...searchForm, returnDate: e.target.value ? new Date(e.target.value) : null})}
                          className="pl-10"
                          data-testid="return-date"
                        />
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      </div>
                    </div>

                    {/* Passengers */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Adults</label>
                      <Select
                        value={searchForm.adults.toString()}
                        onValueChange={(value) => setSearchForm({...searchForm, adults: parseInt(value)})}
                      >
                        <SelectTrigger data-testid="adults-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1,2,3,4,5,6,7,8,9].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} Adult{num > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Children</label>
                      <Select
                        value={searchForm.children.toString()}
                        onValueChange={(value) => setSearchForm({...searchForm, children: parseInt(value)})}
                      >
                        <SelectTrigger data-testid="children-select">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[0,1,2,3,4,5,6,7,8].map(num => (
                            <SelectItem key={num} value={num.toString()}>{num} {num === 1 ? 'Child' : 'Children'}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-red-600 to-blue-600 hover:from-red-700 hover:to-blue-700 text-white font-semibold py-3 text-lg"
                    disabled={loading}
                    data-testid="search-flights-btn"
                  >
                    {loading ? (
                      <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Preparing Search...</>
                    ) : (
                      <><Search className="mr-2 h-4 w-4" /> Search Flights on TravelPayouts</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Search form complete - results will show on TravelPayouts search page */}
          </TabsContent>

          {/* Flight Status Tab */}
          <TabsContent value="status" className="space-y-8">
            <Card className="shadow-lg border-t-4 border-t-blue-600">
              <CardHeader>
                <CardTitle className="flex items-center text-2xl">
                  <Clock className="w-6 h-6 mr-2 text-blue-600" />
                  Check Flight Status
                </CardTitle>
                <CardDescription>
                  Enter your flight number to get real-time status updates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleStatusCheck} className="space-y-4">
                  <div className="flex space-x-4">
                    <Input
                      placeholder="Flight number (e.g., AC123, WS456)"
                      value={statusForm.flightNumber}
                      onChange={(e) => setStatusForm({...statusForm, flightNumber: e.target.value.toUpperCase()})}
                      className="flex-1"
                      data-testid="flight-number-input"
                    />
                    <Button 
                      type="submit" 
                      className="bg-blue-600 hover:bg-blue-700"
                      disabled={loading}
                      data-testid="check-status-btn"
                    >
                      {loading ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Checking...</>
                      ) : (
                        <><Clock className="mr-2 h-4 w-4" /> Check Status</>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Flight Status Results */}
            {flightStatus && (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Flight {flightStatus.flight_number}</span>
                    <Badge 
                      variant={flightStatus.status === 'On Time' ? 'default' : 'secondary'}
                      className={`${flightStatus.status === 'On Time' ? 'bg-green-500' : 
                                 flightStatus.status === 'Delayed' ? 'bg-orange-500' : 
                                 flightStatus.status === 'Cancelled' ? 'bg-red-500' : 'bg-blue-500'} text-white`}
                    >
                      {flightStatus.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{flightStatus.airline}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2">Departure</h4>
                      <div className="space-y-1">
                        <p><span className="font-medium">Airport:</span> {flightStatus.departure_airport}</p>
                        <p><span className="font-medium">Scheduled:</span> {formatTime(flightStatus.scheduled_departure)} on {formatDate(flightStatus.scheduled_departure)}</p>
                        {flightStatus.actual_departure && (
                          <p><span className="font-medium">Actual:</span> {formatTime(flightStatus.actual_departure)}</p>
                        )}
                        {flightStatus.terminal && (
                          <p><span className="font-medium">Terminal:</span> {flightStatus.terminal}</p>
                        )}
                        {flightStatus.gate && (
                          <p><span className="font-medium">Gate:</span> {flightStatus.gate}</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Arrival</h4>
                      <div className="space-y-1">
                        <p><span className="font-medium">Airport:</span> {flightStatus.arrival_airport}</p>
                        <p><span className="font-medium">Scheduled:</span> {formatTime(flightStatus.scheduled_arrival)} on {formatDate(flightStatus.scheduled_arrival)}</p>
                        {flightStatus.actual_arrival && (
                          <p><span className="font-medium">Actual:</span> {formatTime(flightStatus.actual_arrival)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Popular Destinations */}
        {popularDestinations.length > 0 && (
          <section className="mt-12">
            <h3 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-red-600 to-blue-600 bg-clip-text text-transparent">
              Popular Destinations from Toronto
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularDestinations.map((destination, index) => (
                <Card key={index} className="hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <div 
                    className="h-48 bg-cover bg-center rounded-t-lg"
                    style={{ backgroundImage: `url(${destination.image_url})` }}
                  />
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-lg">{destination.city_name}</h4>
                        <p className="text-sm text-gray-600">{destination.country}</p>
                        <p className="text-xs text-gray-500">({destination.destination})</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-blue-600">
                          ${destination.price}
                        </p>
                        <p className="text-sm text-gray-600">{destination.currency}</p>
                      </div>
                    </div>
                    <Separator className="my-3" />
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">{destination.airline}</Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => {
                          // Build search URL for this destination
                          const searchParams = new URLSearchParams({
                            origin_iata: 'YYZ',
                            destination_iata: destination.destination,
                            departure_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
                            adults: '1',
                            children: '0',
                            infants: '0',
                            trip_class: 'Y',
                            marker: 'yyzflights'
                          });
                          
                          const searchUrl = `https://search.yyzflights.com/?${searchParams.toString()}`;
                          window.open(searchUrl, '_blank');
                          toast.success(`Searching flights to ${destination.city_name}...`);
                        }}
                        data-testid={`select-destination-${destination.destination}`}
                      >
                        Search Flights
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-red-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Plane className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold">YYZ Flights</span>
              </div>
              <p className="text-gray-400">
                Toronto's premier flight booking platform, proudly partnered with TravelPayouts 
                to bring you the best deals on flights departing from YYZ.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Flight Search</li>
                <li>Flight Status</li>
                <li>Popular Destinations</li>
                <li>Travel Deals</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">About YYZ Flights</h4>
              <p className="text-gray-400">
                🍁 Proudly Canadian - serving travelers from Toronto Pearson International Airport (YYZ) 
                with the best flight deals worldwide through our TravelPayouts affiliate partnership.
              </p>
            </div>
          </div>
          <Separator className="my-8 bg-gray-700" />
          <div className="text-center text-gray-400">
            <p>&copy; 2024 YYZ Flights. All rights reserved. Powered by TravelPayouts.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;