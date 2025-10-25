// Minimal provinces -> districts mapping for Sri Lanka
export const provinces = [
  { value: 'Western Province', label: 'Western Province' },
  { value: 'Central Province', label: 'Central Province' },
  { value: 'Southern Province', label: 'Southern Province' },
  { value: 'Northern Province', label: 'Northern Province' },
  { value: 'Eastern Province', label: 'Eastern Province' },
  { value: 'North Western Province', label: 'North Western Province' },
  { value: 'North Central Province', label: 'North Central Province' },
  { value: 'Uva Province', label: 'Uva Province' },
  { value: 'Sabaragamuwa Province', label: 'Sabaragamuwa Province' },
];

export const districtsByProvince = {
  'Western Province': [ 'Colombo', 'Gampaha', 'Kalutara' ],
  'Central Province': [ 'Kandy', 'Matale', 'Nuwara Eliya' ],
  'Southern Province': [ 'Galle', 'Matara', 'Hambantota' ],
  'Northern Province': [ 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya', 'Mullaitivu' ],
  'Eastern Province': [ 'Trincomalee', 'Batticaloa', 'Ampara' ],
  'North Western Province': [ 'Kurunegala', 'Puttalam' ],
  'North Central Province': [ 'Anuradhapura', 'Polonnaruwa' ],
  'Uva Province': [ 'Badulla', 'Moneragala' ],
  'Sabaragamuwa Province': [ 'Ratnapura', 'Kegalle' ],
};
