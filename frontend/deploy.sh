#!/bin/bash

echo "🛫 YYZ Flights Website Quick Deployment Script"
echo "============================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the frontend directory"
    echo "Usage: cd frontend && ./deploy.sh"
    exit 1
fi

echo "📦 Installing dependencies..."
if command -v yarn &> /dev/null; then
    yarn install
else
    echo "⚠️  Yarn not found, using npm..."
    npm install
fi

echo "🏗️  Building the website..."
if command -v yarn &> /dev/null; then
    yarn build
else
    npm run build
fi

echo "✅ Build complete!"
echo ""
echo "🚀 Deployment Instructions:"
echo "1. Upload all files from the 'build' folder to your web hosting"
echo "2. Configure your domain to point to your hosting provider"
echo "3. Set up SSL certificate for HTTPS"
echo "4. Test the website functionality"
echo ""
echo "📁 Built files are in: $(pwd)/build/"
echo ""
echo "🔗 Key Integrations:"
echo "   • TravelPayouts: https://search.yyzflights.com/"
echo "   • Tiqets: Toronto attractions widget"
echo "   • Trip.com: Alternative flight search"
echo ""
echo "🛫 Your YYZ Flights website is ready for deployment!"