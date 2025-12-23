import re
import math

# Read the file
input_file = r'c:\Users\herbe\Downloads\Duhigg-Supercommunicators.md'
output_file = r'c:\Users\herbe\Downloads\Duhigg-Supercommunicators.md'

with open(input_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Extract the LocationToPage formula from metadata
# Formula: (x - 194) / 13
offset = 194
divisor = 13

# Pattern to match location lines
# Matches: location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272
pattern = r'location: \[(\d+)\]\(kindle://book\?action=open&asin=([A-Z0-9]+)&location=(\d+)\) \^ref-(\d+)'

def calculate_page(location_num):
    """Calculate page number using the formula (x - offset) / divisor"""
    page = (int(location_num) - offset) / divisor
    return math.floor(page)

def replace_location(match):
    """Replace location line with page number added"""
    location_display = match.group(1)
    asin = match.group(2)
    location_link = match.group(3)
    ref_num = match.group(4)
    
    # Calculate page number
    page_num = calculate_page(location_link)
    
    # Return the updated line with page number
    return f'location: [{location_display}](kindle://book?action=open&asin={asin}&location={location_link}) ^ref-{ref_num} Page: {page_num}'

# Replace all location lines
updated_content = re.sub(pattern, replace_location, content)

# Write back to file
with open(output_file, 'w', encoding='utf-8') as f:
    f.write(updated_content)

print(f"Successfully updated {output_file}")
print(f"Formula used: (x - {offset}) / {divisor}")
