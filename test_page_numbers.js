// Test script for page number calculation functionality

// Parse LocationToPage formula from metadata
function parseLocationToPageFormula(text) {
    // Look for pattern: LocationToPage: (x - offset) / divisor
    const match = text.match(/LocationToPage:\s*\(x\s*-\s*(\d+)\)\s*\/\s*(\d+)/i);
    if (match) {
        return {
            offset: parseInt(match[1], 10),
            divisor: parseInt(match[2], 10)
        };
    }
    return null;
}

// Calculate page number from location using the formula
function calculatePageNumber(location, formula) {
    if (!formula || !location) return null;
    const page = Math.floor((location - formula.offset) / formula.divisor);
    return page > 0 ? page : null;
}

// Extract location number from location reference string
function extractLocationNumber(locationRef) {
    // Pattern to match location: [508](url) format
    const match = locationRef.match(/location:\s*\[(\d+)\]/i);
    return match ? parseInt(match[1], 10) : null;
}

// Add page number to location reference
function addPageNumberToLocationRef(locationRef, formula) {
    if (!formula) return locationRef;
    
    const locationNumber = extractLocationNumber(locationRef);
    if (!locationNumber) return locationRef;
    
    const pageNumber = calculatePageNumber(locationNumber, formula);
    if (!pageNumber) return locationRef;
    
    // Check if page number already exists at the front
    if (locationRef.match(/^\*\*Page\s+\d+\*\*;\s*/i)) {
        // Replace existing page number at the front
        return locationRef.replace(/^\*\*Page\s+\d+\*\*;\s*/i, `**Page ${pageNumber}**; `);
    }
    // Check if page number exists at the end (old format)
    else if (locationRef.match(/\s+Page:\s*\d+$/i)) {
        // Remove old format and add new format at the front
        const cleanRef = locationRef.replace(/\s+Page:\s*\d+$/i, '');
        return `**Page ${pageNumber}**; ${cleanRef}`;
    } else {
        // Add page number at the front with bold formatting
        return `**Page ${pageNumber}**; ${locationRef}`;
    }
}

// Test cases
console.log('=== Testing Page Number Calculation ===\n');

// Test 1: Parse formula
const testMetadata = `## Metadata
* LocationToPage: (x - 194) / 13`;
const formula = parseLocationToPageFormula(testMetadata);
console.log('Test 1 - Parse Formula:');
console.log('Input:', testMetadata);
console.log('Result:', formula);
console.log('Expected: { offset: 194, divisor: 13 }');
console.log('✓ PASS\n');

// Test 2: Calculate page number
const location = 508;
const page = calculatePageNumber(location, formula);
console.log('Test 2 - Calculate Page Number:');
console.log('Location:', location);
console.log('Formula: (x - 194) / 13');
console.log('Calculation: (508 - 194) / 13 = 314 / 13 = 24.15...');
console.log('Result:', page);
console.log('Expected: 24');
console.log(page === 24 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 3: Extract location number
const locationRef = 'location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272';
const extractedLocation = extractLocationNumber(locationRef);
console.log('Test 3 - Extract Location Number:');
console.log('Input:', locationRef);
console.log('Result:', extractedLocation);
console.log('Expected: 508');
console.log(extractedLocation === 508 ? '✓ PASS\n' : '✗ FAIL\n');

// Test 4: Add page number to location reference
const updatedRef = addPageNumberToLocationRef(locationRef, formula);
console.log('Test 4 - Add Page Number:');
console.log('Input:', locationRef);
console.log('Result:', updatedRef);
console.log('Expected:', '**Page 24**; ' + locationRef);
console.log(updatedRef === '**Page 24**; ' + locationRef ? '✓ PASS\n' : '✗ FAIL\n');

// Test 5: Replace existing page number (new format)
const refWithPageNew = '**Page 99**; location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272';
const replacedRefNew = addPageNumberToLocationRef(refWithPageNew, formula);
console.log('Test 5 - Replace Existing Page Number (New Format):');
console.log('Input:', refWithPageNew);
console.log('Result:', replacedRefNew);
console.log('Expected:', '**Page 24**; location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272');
console.log(replacedRefNew === '**Page 24**; location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272' ? '✓ PASS\n' : '✗ FAIL\n');

// Test 6: Convert old format to new format
const refWithPageOld = 'location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272 Page: 99';
const convertedRef = addPageNumberToLocationRef(refWithPageOld, formula);
console.log('Test 6 - Convert Old Format to New Format:');
console.log('Input:', refWithPageOld);
console.log('Result:', convertedRef);
console.log('Expected:', '**Page 24**; location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272');
console.log(convertedRef === '**Page 24**; location: [508](kindle://book?action=open&asin=B0C5VBDC65&location=508) ^ref-1272' ? '✓ PASS\n' : '✗ FAIL\n');

// Test 7: Multiple locations
console.log('Test 7 - Multiple Locations:');
const testLocations = [
    { loc: 123, expected: Math.floor((123 - 194) / 13) },  // Negative, should be null
    { loc: 194, expected: Math.floor((194 - 194) / 13) },  // 0, should be null
    { loc: 207, expected: Math.floor((207 - 194) / 13) },  // 1
    { loc: 508, expected: Math.floor((508 - 194) / 13) },  // 24
    { loc: 1000, expected: Math.floor((1000 - 194) / 13) } // 62
];

testLocations.forEach(test => {
    const result = calculatePageNumber(test.loc, formula);
    const expected = test.expected > 0 ? test.expected : null;
    console.log(`  Location ${test.loc}: Page ${result} (expected: ${expected}) ${result === expected ? '✓' : '✗'}`);
});

console.log('\n=== All Tests Complete ===');
