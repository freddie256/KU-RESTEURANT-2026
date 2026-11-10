# KU Restaurant - Deployment Guide

## What changed
- Fork & spoon icon replaced by the Kampala University eagle logo (all pages + favicon).
- Ordering is WhatsApp-only: the order opens in WhatsApp (number in site-config.js). No PHP or server needed.

## Publish on Netlify (recommended)
1. Upload this folder to Netlify (drag & drop) OR push it to GitHub and import the repo in Netlify.



## Notes
- GitHub Pages alone cannot run PHP or Netlify Forms. Use GitHub -> Netlify.
- The `backend/` folder (PHP + MySQL) is kept for projects hosted on a PHP server (XAMPP, cPanel).
  It is not used on Netlify.
- Change the WhatsApp number / email in `site-config.js`.
