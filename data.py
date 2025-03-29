import csv
import uuid
import json

# Define a mapping function that tries several possible keys from the CSV row
def get_field(row, possible_keys):
    for key in possible_keys:
        if key in row and row[key].strip():
            return row[key].strip()
    return ""

# Open the CSV file (update the file path if needed)
input_csv = '/Users/prabinnepal/Downloads/companies.csv'
output_json = 'companies_converted.json'

data = []
with open(input_csv, newline='', encoding='utf-8') as csvfile:
    # Create a DictReader to read rows into dictionaries
    reader = csv.DictReader(csvfile)
    
    # Optionally, print header names so you can verify the CSV structure
    print("CSV Headers found:", reader.fieldnames)
    
    for row in reader:
        record = {
            "id": str(uuid.uuid4()),
            "symbol": get_field(row, ["ticker", "Ticker", "Symbol"]),
            "name": get_field(row, ["company name", "Company Name", "Name"]),
            "exchange": get_field(row, ["exchange", "Exchange"]),
            "sector": get_field(row, ["sector", "Sector"]),
            "industry": get_field(row, ["industry", "Industry"]),
            "website": get_field(row, ["website", "Website"]),
            "description": get_field(row, ["description", "Description"]),
            "logo": get_field(row, ["logo", "Logo", "Logo URL"])
        }
        data.append(record)

# Write out the converted data as JSON
with open(output_json, 'w', encoding='utf-8') as outfile:
    json.dump(data, outfile, indent=2)

print(f"Conversion complete. {len(data)} records saved to {output_json}")
