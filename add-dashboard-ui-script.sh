#!/bin/bash
# Script to add dashboard-ui.js to index.html

echo "Adding dashboard-ui.js script tag to index.html..."

# Find the line with dashboard-api.js and add dashboard-ui.js after it
sed -i '' '/dashboard-api.js/a\
    <script src="/irl-assessment-platform/js/dashboard-ui.js"></script>
' index.html

echo "Done! dashboard-ui.js has been added to index.html"
