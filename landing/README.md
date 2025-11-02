# Landing Page - Modular Structure

## 🏗️ Structure Overview

This landing page has been split into modular files for easier maintenance and updates.

```
landing/
├── index.html           # Main HTML file (imports all modules)
├── css/                 # Stylesheets
│   ├── variables.css    # Design tokens and CSS variables
│   ├── base.css         # Base styles and animations
│   ├── header.css       # Header and navigation
│   ├── hero.css         # Hero section
│   ├── features.css     # Features section
│   ├── account-types.css # Account types section
│   ├── modals.css       # Modal styles
│   ├── buttons.css      # Button styles
│   ├── forms.css        # Form styles
│   ├── footer.css       # Footer styles
│   └── responsive.css   # Mobile responsive styles
├── js/                  # JavaScript modules
│   ├── modals.js        # Modal management
│   ├── forms.js         # Form handling and validation
│   └── navigation.js    # Navigation and scrolling
└── README.md            # This file
```

## ✅ Benefits of Modular Structure

### Easy Updates
- Want to change the header? Edit only `css/header.css`
- Need to update modal behavior? Edit only `js/modals.js`
- Want to adjust colors? Edit only `css/variables.css`

### No Code Duplication
- Each component defined once
- Changes automatically apply everywhere
- Consistent styling across the site

### Better Collaboration
- Multiple people can work on different files
- No conflicts or overwrites
- Clear separation of concerns

## 🛠️ Making Changes

### To Update Colors/Design:
```css
/* Edit: landing/css/variables.css */
:root {
    --primary-color: #1a1a1a;  /* Change this */
    --background: #ffffff;      /* Change this */
}
```

### To Update Header:
```css
/* Edit: landing/css/header.css */
.logo {
    /* Your changes here */
}
```

### To Update Modal Behavior:
```javascript
/* Edit: landing/js/modals.js */
function showSignIn() {
    /* Your changes here */
}
```

### To Add New Form Validation:
```javascript
/* Edit: landing/js/forms.js */
function handleSignUp(event) {
    /* Add your validation here */
}
```

## 💡 Common Edits

### Change Button Colors:
Edit `css/buttons.css`

### Adjust Hero Section:
Edit `css/hero.css`

### Modify Feature Cards:
Edit `css/features.css`

### Update Mobile Styles:
Edit `css/responsive.css`

### Change Form Behavior:
Edit `js/forms.js`

## 🎯 Best Practices

1. **One file, one purpose** - Keep changes focused
2. **Test after changes** - Preview the page after editing
3. **Use variables** - Change `variables.css` for global updates
4. **Comment your code** - Help future you understand changes
5. **Keep backups** - Git will save you!

## 🚀 Next Steps

To push these changes:
```bash
git add landing/
git commit -m "Refactor landing page into modular structure"
git push origin modular-structure
```

Then create a pull request to merge into main!
