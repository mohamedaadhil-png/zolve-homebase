-- ============================================================
-- Zolve HomeBase — Seed Data (31 MVP Companies)
-- ============================================================

INSERT INTO companies (
  name_raw, canonical_name, normalized_name,
  ats_provider, ats_board_token, domain,
  sponsor_flag, industry, company_size
) VALUES
  ('Databricks',  'Databricks',  'databricks',  'greenhouse', 'databricks',   'databricks.com',  true, 'Data & AI',                  'Large'),
  ('Stripe',      'Stripe',      'stripe',      'greenhouse', 'stripe',       'stripe.com',      true, 'Fintech',                    'Large'),
  ('MongoDB',     'MongoDB',     'mongodb',     'greenhouse', 'mongodb',      'mongodb.com',     true, 'Database/Cloud',             'Large'),
  ('Datadog',     'Datadog',     'datadog',     'greenhouse', 'datadog',      'datadoghq.com',   true, 'DevOps/Monitoring',          'Large'),
  ('Anthropic',   'Anthropic',   'anthropic',   'greenhouse', 'anthropic',    'anthropic.com',   true, 'AI Research',                'Medium'),
  ('Samsara',     'Samsara',     'samsara',     'greenhouse', 'samsara',      'samsara.com',     true, 'IoT/Fleet Tech',             'Large'),
  ('Zscaler',     'Zscaler',     'zscaler',     'greenhouse', 'zscaler',      'zscaler.com',     true, 'Cybersecurity',              'Large'),
  ('Verkada',     'Verkada',     'verkada',     'greenhouse', 'verkada',      'verkada.com',     true, 'Security Tech',              'Medium'),
  ('Airbnb',      'Airbnb',      'airbnb',      'greenhouse', 'airbnb',       'airbnb.com',      true, 'Travel/Marketplace',         'Large'),
  ('Roblox',      'Roblox',      'roblox',      'greenhouse', 'roblox',       'roblox.com',      true, 'Gaming/Metaverse',           'Large'),
  ('Brex',        'Brex',        'brex',        'greenhouse', 'brex',         'brex.com',        true, 'Fintech',                    'Medium'),
  ('Pinterest',   'Pinterest',   'pinterest',   'greenhouse', 'pinterest',    'pinterest.com',   true, 'Social Media',               'Large'),
  ('Cloudflare',  'Cloudflare',  'cloudflare',  'greenhouse', 'cloudflare',   'cloudflare.com',  true, 'Infrastructure/Security',    'Large'),
  ('Affirm',      'Affirm',      'affirm',      'greenhouse', 'affirm',       'affirm.com',      true, 'Fintech/BNPL',               'Large'),
  ('Reddit',      'Reddit',      'reddit',      'greenhouse', 'reddit',       'reddit.com',      true, 'Social Media',               'Large'),
  ('GitLab',      'GitLab',      'gitlab',      'greenhouse', 'gitlab',       'gitlab.com',      true, 'DevOps/Software Dev',        'Large'),
  ('Robinhood',   'Robinhood',   'robinhood',   'greenhouse', 'robinhood',    'robinhood.com',   true, 'Fintech',                    'Large'),
  ('Twilio',      'Twilio',      'twilio',      'greenhouse', 'twilio',       'twilio.com',      true, 'Communications API',         'Large'),
  ('Asana',       'Asana',       'asana',       'greenhouse', 'asana',        'asana.com',       true, 'Productivity/SaaS',          'Large'),
  ('Instacart',   'Instacart',   'instacart',   'greenhouse', 'instacart',    'instacart.com',   true, 'Grocery/Delivery',           'Large'),
  ('SoFi',        'SoFi',        'sofi',        'greenhouse', 'sofi',         'sofi.com',        true, 'Fintech',                    'Large'),
  ('Lyft',        'Lyft',        'lyft',        'greenhouse', 'lyft',         'lyft.com',        true, 'Ridesharing',                'Large'),
  ('Nuro',        'Nuro',        'nuro',        'greenhouse', 'nuro',         'nuro.ai',         true, 'Autonomous Vehicles',        'Medium'),
  ('Flexport',    'Flexport',    'flexport',    'greenhouse', 'flexport',     'flexport.com',    true, 'Logistics/Supply Chain',     'Large'),
  ('Gusto',       'Gusto',       'gusto',       'greenhouse', 'gusto',        'gusto.com',       true, 'HR/Payroll SaaS',            'Large'),
  ('Discord',     'Discord',     'discord',     'greenhouse', 'discord',      'discord.com',     true, 'Communication/Gaming',       'Large'),
  ('Chime',       'Chime',       'chime',       'greenhouse', 'chime',        'chime.com',       true, 'Neobank/Fintech',            'Large'),
  ('Dropbox',     'Dropbox',     'dropbox',     'greenhouse', 'dropbox',      'dropbox.com',     true, 'Cloud Storage/SaaS',         'Large'),
  ('DoorDash',    'DoorDash',    'doordash',    'greenhouse', 'doordashUSA',  'doordash.com',    true, 'Food Delivery',              'Large'),
  ('Figma',       'Figma',       'figma',       'greenhouse', 'figma',        'figma.com',       true, 'Design Tools/SaaS',          'Large'),
  ('Airtable',    'Airtable',    'airtable',    'greenhouse', 'airtable',     'airtable.com',    true, 'No-code/Collaboration',      'Medium')
ON CONFLICT DO NOTHING;

-- ============================================================
-- Company aliases
-- ============================================================
INSERT INTO company_aliases (alias_raw, company_id)
SELECT 'doordashusa',   id FROM companies WHERE canonical_name = 'DoorDash'
UNION ALL
SELECT 'doordash usa',  id FROM companies WHERE canonical_name = 'DoorDash'
UNION ALL
SELECT 'mongo db',      id FROM companies WHERE canonical_name = 'MongoDB'
UNION ALL
SELECT 'gitlab inc',    id FROM companies WHERE canonical_name = 'GitLab'
UNION ALL
SELECT 'cloudflare inc',id FROM companies WHERE canonical_name = 'Cloudflare'
UNION ALL
SELECT 'robinhood markets', id FROM companies WHERE canonical_name = 'Robinhood'
ON CONFLICT DO NOTHING;
