# YYZ Flights Website Deployment Instructions

## 🛫 YYZ Flights - Toronto's Premier Flight Booking Platform

This is a complete travel booking website with TravelPayouts integration, Tiqets Toronto attractions, and Trip.com alternative search.

### 🎨 Features
- **Flight Search**: Redirects to your TravelPayouts white-label search at `https://search.yyzflights.com/`
- **Flight Status Lookup**: Real-time flight status checking
- **Toronto Attractions**: Integrated Tiqets widget for CN Tower, Casa Loma, ROM, etc.
- **Alternative Search**: Trip.com integration for additional flight options
- **Canadian Theme**: Red, white, blue design with Toronto skyline

---

## 📁 Project Structure

```
yyzflights-website/
├── frontend/          # React application (main website)
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── ...
├── backend/           # FastAPI backend (optional for flight status)
│   ├── server.py
│   ├── requirements.txt
│   └── ...
└── DEPLOYMENT_INSTRUCTIONS.md
```

---

## 🚀 Frontend Deployment (Static Website)

### Option 1: Static Hosting (Recommended for basic deployment)

1. **Build the React App**:
   ```bash
   cd frontend
   yarn install
   yarn build
   ```

2. **Upload `build/` folder contents** to your web hosting:
   - Upload all files from `frontend/build/` to your domain's root directory
   - Ensure your hosting supports HTML5 routing (for React Router)

3. **Configure Domain**:
   - Point your domain to the hosting provider
   - Set up SSL certificate for HTTPS

### Option 2: Full Stack Deployment (with backend)

If you want the flight status functionality and backend APIs:

1. **Frontend Build**:
   ```bash
   cd frontend
   yarn install
   yarn build
   ```

2. **Backend Setup**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python server.py  # Or use a production server like Gunicorn
   ```

3. **Environment Variables**:
   Create `frontend/.env`:
   ```
   REACT_APP_BACKEND_URL=https://yourdomain.com
   ```

---

## ⚙️ Configuration

### 1. TravelPayouts Integration
The website is already configured to redirect to:
```
https://search.yyzflights.com/
```

**Parameters passed**:
- `origin_iata=YYZ`
- `destination_iata=[selected destination]`
- `departure_at=[selected date]`
- `return_at=[selected return date]`
- `adults=[number of adults]`
- `children=[number of children]`
- `marker=yyzflights`

### 2. Tiqets Integration
The website includes:
- Tiqets widget iframe for Toronto attractions
- Direct links to CN Tower, Casa Loma, ROM, Ripley's Aquarium
- Partner ID: `yyzflights` (update in App.js if needed)

### 3. Trip.com Integration
Alternative search button redirects to Trip.com with search parameters.

---

## 🔧 Customization

### Update Partner IDs
In `frontend/src/App.js`, find and update:

```javascript
// TravelPayouts marker
marker: 'yyzflights'

// Tiqets partner ID
?partner=yyzflights

// Update these to your actual affiliate IDs
```

### Modify Destinations
Update the destination list in `frontend/src/App.js`:

```javascript
<SelectContent>
  <SelectItem value="LAX">LAX - Los Angeles, USA</SelectItem>
  // Add more destinations here
</SelectContent>
```

### Change Colors/Branding
Update the Canadian theme colors in `frontend/src/App.css` and components.

---

## 🌐 Domain Setup

### DNS Configuration
1. Point your domain to your hosting provider
2. Set up CNAME for `search.yyzflights.com` → `whitelabel.travelpayouts.com` (already done)
3. Configure SSL certificate

### Hosting Providers
The built React app can be hosted on:
- **Netlify** (recommended for static sites)
- **Vercel**
- **GitHub Pages**
- **Traditional web hosting** (cPanel, etc.)
- **AWS S3 + CloudFront**

---

## 📱 Testing

### Before Going Live:
1. Test flight search redirects to `https://search.yyzflights.com/`
2. Verify Tiqets attractions load properly
3. Check Trip.com alternative search works
4. Test responsive design on mobile/tablet
5. Verify all affiliate links have correct partner IDs

---

## 🛠️ Troubleshooting

### Common Issues:

1. **React Router not working**:
   - Configure your hosting for HTML5 routing
   - Add `.htaccess` for Apache or nginx rewrite rules

2. **CORS issues with backend**:
   - Update backend CORS settings
   - Ensure frontend points to correct backend URL

3. **Affiliate links not tracking**:
   - Verify partner IDs are correct
   - Check that parameters are being passed properly

---

## 📞 Support

For technical issues with:
- **TravelPayouts**: Contact TravelPayouts support
- **Tiqets**: Contact Tiqets affiliate program
- **Website Code**: Refer to React and FastAPI documentation

---

## 🔒 Security Notes

- Never expose API keys in frontend code
- Use environment variables for sensitive data
- Ensure HTTPS is enabled for your domain
- Regularly update dependencies

---

## 📈 Analytics & Tracking

Consider adding:
- Google Analytics for traffic tracking
- Conversion tracking for affiliate links
- Heat mapping tools to optimize user experience

---

**Your YYZ Flights website is ready for deployment! 🛫🇨🇦**