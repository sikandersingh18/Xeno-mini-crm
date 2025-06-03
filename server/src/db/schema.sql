-- Create customers table
CREATE TABLE customers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  spend DECIMAL(10,2) DEFAULT 0,
  visits INTEGER DEFAULT 0,
  last_active TIMESTAMP,
  location VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create campaigns table
CREATE TABLE campaigns (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  rules JSONB NOT NULL,
  audience_size INTEGER NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create communication_log table
CREATE TABLE communication_log (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent INTEGER NOT NULL DEFAULT 0,
  failed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create delivery_status table
CREATE TABLE delivery_status (
  id SERIAL PRIMARY KEY,
  campaign_id INTEGER REFERENCES campaigns(id),
  recipient_id INTEGER REFERENCES customers(id),
  status VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(campaign_id, recipient_id)
);

-- Create indexes
CREATE INDEX idx_customers_spend ON customers(spend);
CREATE INDEX idx_customers_visits ON customers(visits);
CREATE INDEX idx_customers_last_active ON customers(last_active);
CREATE INDEX idx_customers_location ON customers(location);
CREATE INDEX idx_campaigns_status ON campaigns(status);
CREATE INDEX idx_delivery_status_campaign ON delivery_status(campaign_id);
CREATE INDEX idx_communication_log_campaign ON communication_log(campaign_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON campaigns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_communication_log_updated_at
  BEFORE UPDATE ON communication_log
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_delivery_status_updated_at
  BEFORE UPDATE ON delivery_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column(); 