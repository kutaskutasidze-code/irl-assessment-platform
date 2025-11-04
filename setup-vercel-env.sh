#!/bin/bash
# Script to set Vercel environment variables

echo "Setting Vercel environment variables..."

# Your credentials
SUPABASE_URL="https://mtzrkseneyiogpaqiorh.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10enJrc2VuZXlpb2dwYXFpb3JoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMzA1MTEsImV4cCI6MjA3NzgwNjUxMX0.A5dvxQVrhVuF4xYeuMBgtLkCcPXZSdyq0P5GD-T8INk"
JWT_SECRET="6e7191c9e3ff675da3aae4ad33a53eff0741128bde86ac4490e43e564679e965"

echo ""
echo "Copy these values to Vercel:"
echo "================================"
echo ""
echo "SUPABASE_URL=$SUPABASE_URL"
echo ""
echo "SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY"
echo ""
echo "JWT_SECRET=$JWT_SECRET"
echo ""
echo "================================"
echo ""
echo "How to add to Vercel:"
echo "1. Go to: https://vercel.com/dashboard"
echo "2. Select your project"
echo "3. Settings → Environment Variables"
echo "4. Add each variable above"
echo "5. Save and redeploy"
