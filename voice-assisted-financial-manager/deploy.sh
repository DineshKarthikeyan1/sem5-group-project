#!/bin/bash

# VoiceFinance Vercel Deployment Script
echo "🚀 Deploying VoiceFinance to Vercel..."

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Installing..."
    npm install -g vercel
fi

# Build the project locally first to check for errors
echo "🔨 Building project locally..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Local build successful!"
    
    # Deploy to Vercel
    echo "🌐 Deploying to Vercel..."
    vercel --prod
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deployment successful!"
        echo "📱 Your app is now live on Vercel!"
    else
        echo "❌ Deployment failed. Check the error messages above."
        exit 1
    fi
else
    echo "❌ Local build failed. Please fix the errors before deploying."
    exit 1
fi