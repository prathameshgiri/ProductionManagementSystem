const fs = require('fs');
const path = require('path');

const employeesPath = path.join(__dirname, 'database', 'employees.json');
const employees = JSON.parse(fs.readFileSync(employeesPath, 'utf8'));

const nameMap = {
  "James Wilson": "Jai Sharma",
  "Maria Garcia": "Meera Gupta",
  "Robert Chen": "Rohan Chawla",
  "Emily Johnson": "Esha Joshi",
  "David Kim": "Deepak Kumar",
  "Sophie Turner": "Sonal Tiwari",
  "Carlos Rodriguez": "Chetan Reddy",
  "Anna Lee": "Anjali Loya",
  "Tom Bradley": "Tarun Bansal",
  "Priya Patel": "Priya Patel",
  "Mark Thompson": "Manish Tripathi",
  "Nina Petrov": "Neha Pandey",
  "Alex Morgan": "Aditya Mishra",
  "Lisa Chang": "Lata Chavan",
  "Ben Foster": "Bharat Phadke"
};

const formatEmail = (name) => {
  return name.toLowerCase().replace(' ', '.') + '@prathameshgiri.in';
};

const updatedEmployees = employees.map(emp => {
  const newName = nameMap[emp.name] || emp.name;
  return {
    ...emp,
    name: newName,
    email: formatEmail(newName)
  };
});

fs.writeFileSync(employeesPath, JSON.stringify(updatedEmployees, null, 2));
console.log('Employees updated successfully.');
