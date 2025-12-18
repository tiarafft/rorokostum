/*
  # Add Social Media and Google Maps Settings

  1. New Settings
    - Add Facebook URL setting
    - Add Instagram URL setting
    - Add Google Maps embed URL setting
    - Add Google Maps location link setting

  2. Notes
    - These settings will be managed through admin panel
    - Social media icons will appear in footer
    - Google Maps will be embedded in company profile or contact section
*/

-- Insert social media and maps settings
INSERT INTO settings (key, value) VALUES
  ('facebook_url', ''),
  ('instagram_url', ''),
  ('google_maps_embed', ''),
  ('google_maps_link', '')
ON CONFLICT (key) DO NOTHING;