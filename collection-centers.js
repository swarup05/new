// API Configuration
const GEMINI_API_KEY = 'AIzaSyDDxU_TpHGQ9PDRPnobrZN9yH-6KbgmvdY';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Collection Centers Data
const collectionCenters = [
    { name: "Pune Recycling Hub", type: "plastic", location: "Pune", address: "123 Main St, Pune, Maharashtra" },
    { name: "Mumbai Waste Center", type: "paper", location: "Mumbai", address: "456 Marine Drive, Mumbai, Maharashtra" },
    { name: "Delhi Green Station", type: "glass", location: "Delhi", address: "789 Connaught Place, New Delhi" },
    { name: "Bangalore Eco Center", type: "metal", location: "Bangalore", address: "321 MG Road, Bangalore, Karnataka" },
    { name: "Chennai Recycling Point", type: "organic", location: "Chennai", address: "654 Marina Beach Road, Chennai, Tamil Nadu" },
    { name: "Hyderabad Waste Hub", type: "plastic", location: "Hyderabad", address: "987 Tank Bund Road, Hyderabad, Telangana" },
    { name: "Alandi Eco Center", type: "organic", location: "Alandi", address: "45 Temple Road, Alandi, Maharashtra" },
    { name: "Alandi Waste Management", type: "plastic", location: "Alandi", address: "78 Main Market, Alandi, Maharashtra" },
    { name: "Nashik Green Hub", type: "paper", location: "Nashik", address: "123 College Road, Nashik, Maharashtra" },
    { name: "Nashik Recycling Center", type: "glass", location: "Nashik", address: "456 Gangapur Road, Nashik, Maharashtra" },
    { name: "Indore Waste Solutions", type: "metal", location: "Indore", address: "789 MG Road, Indore, Madhya Pradesh" },
    { name: "Indore Eco Station", type: "plastic", location: "Indore", address: "321 Palasia Square, Indore, Madhya Pradesh" },
    { name: "Surat Recycling Hub", type: "paper", location: "Surat", address: "654 Athwa Circle, Surat, Gujarat" },
    { name: "Surat Waste Center", type: "organic", location: "Surat", address: "987 Vesu Road, Surat, Gujarat" }
];

// Initialize collection centers
function initializeCollectionCenters() {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await findCenters();
        });
    }
}

// Show loading state
function setLoading(isLoading) {
    const button = document.querySelector('.search-box button');
    const buttonText = button.querySelector('.button-text');
    const loadingSpinner = button.querySelector('.loading-spinner');
    const errorMessage = document.getElementById('search-error');

    if (isLoading) {
        button.classList.add('loading');
        button.disabled = true;
        errorMessage.style.display = 'none';
    } else {
        button.classList.remove('loading');
        button.disabled = false;
    }
}

// Show error message
function showError(message) {
    const errorMessage = document.getElementById('search-error');
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

// Get city waste data from Gemini API
async function getCityWasteData(city) {
    try {
        // First, validate the city input
        if (!city || city.trim().length < 2) {
            throw new Error('Please enter a valid city name');
        }

        const prompt = `Generate current waste management statistics for ${city} in India. 
        Provide the data in this exact JSON format:
        {
            "city": "${city}",
            "totalWaste": number between 100 and 5000,
            "wasteComposition": {
                "plastic": number between 10 and 30,
                "paper": number between 15 and 35,
                "glass": number between 5 and 15,
                "metal": number between 5 and 15,
                "organic": number between 30 and 50
            },
            "recyclingRate": number between 20 and 80,
            "population": number between 100000 and 20000000,
            "collectionEfficiency": number between 60 and 95
        }
        Make sure all numbers are realistic and the sum of wasteComposition percentages equals 100.`;

        console.log('Sending request to Gemini API...');
        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }],
                generationConfig: {
                    temperature: 0.2,
                    topK: 20,
                    topP: 0.8,
                    maxOutputTokens: 512,
                }
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('API Error:', errorData);
            throw new Error(`API Error: ${errorData.error?.message || 'Failed to fetch data'}`);
        }

        const data = await response.json();
        console.log('Raw API Response:', data);

        if (!data.candidates?.[0]?.content?.parts?.[0]?.text) {
            throw new Error('Invalid response format from API');
        }

        // Parse the response text as JSON
        const responseText = data.candidates[0].content.parts[0].text;
        console.log('API Response Text:', responseText);

        // Try to extract JSON from the response text
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No valid JSON found in API response');
        }

        const parsedData = JSON.parse(jsonMatch[0]);
        console.log('Parsed Data:', parsedData);

        // Validate the parsed data
        if (!parsedData.city || !parsedData.wasteComposition || !parsedData.recyclingRate) {
            throw new Error('Invalid data structure in API response');
        }

        // Ensure waste composition percentages sum to 100
        const compositionSum = Object.values(parsedData.wasteComposition).reduce((a, b) => a + b, 0);
        if (Math.abs(compositionSum - 100) > 1) { // Allow for small rounding errors
            throw new Error('Waste composition percentages must sum to 100');
        }

        return parsedData;
    } catch (error) {
        console.error('Error in getCityWasteData:', error);
        throw error;
    }
}

// Find collection centers
async function findCenters() {
    try {
        setLoading(true);
        const location = document.getElementById('location').value.toLowerCase();
        const type = document.getElementById('waste-type-filter').value;
        
        if (!location) {
            throw new Error('Please enter a city name');
        }

        // Get city waste data
        const cityData = await getCityWasteData(location);
        console.log('City Data:', cityData);
        
        // Filter centers
        const filteredCenters = collectionCenters.filter(center => {
            const locationMatch = center.location.toLowerCase().includes(location);
            const typeMatch = type === 'all' || center.type === type;
            return locationMatch && typeMatch;
        });

        displayCenters(filteredCenters);
        renderWasteGraphs(filteredCenters, cityData);
    } catch (error) {
        console.error('Error in findCenters:', error);
        showError(error.message || 'Failed to fetch city data. Please try again.');
    } finally {
        setLoading(false);
    }
}

// Display collection centers
function displayCenters(centers) {
    const centersList = document.getElementById('centers-list');
    if (!centersList) return;

    centersList.innerHTML = '';
    
    if (centers.length === 0) {
        centersList.innerHTML = '<p class="no-results">No collection centers found in this area.</p>';
        return;
    }

    centers.forEach(center => {
        const div = document.createElement('div');
        div.className = 'center-card';
        div.innerHTML = `
            <h3>${center.name}</h3>
            <p><i class="fas fa-trash"></i><strong>Type:</strong> ${center.type.charAt(0).toUpperCase() + center.type.slice(1)}</p>
            <p><i class="fas fa-map-marker-alt"></i><strong>Location:</strong> ${center.location}</p>
            <p><i class="fas fa-address-card"></i><strong>Address:</strong> ${center.address}</p>
        `;
        centersList.appendChild(div);
    });
}

// Render waste graphs
function renderWasteGraphs(centers, cityData) {
    const graphContainer = document.getElementById('graph-container');
    if (!graphContainer) return;

    // Clear previous content
    graphContainer.innerHTML = '';

    // Create canvas for the waste composition chart
    const compositionCanvas = document.createElement('canvas');
    compositionCanvas.id = 'wasteCompositionChart';
    graphContainer.appendChild(compositionCanvas);

    // Create canvas for the recycling rate chart
    const recyclingCanvas = document.createElement('canvas');
    recyclingCanvas.id = 'recyclingRateChart';
    graphContainer.appendChild(recyclingCanvas);

    // Common chart options
    const commonOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle'
                }
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                padding: 12,
                titleFont: {
                    size: 14,
                    weight: 'bold'
                },
                bodyFont: {
                    size: 13
                },
                callbacks: {
                    label: function(context) {
                        return `${context.label}: ${context.raw}%`;
                    }
                }
            }
        }
    };

    // Waste Composition Chart
    new Chart(compositionCanvas.getContext('2d'), {
        type: 'pie',
        data: {
            labels: Object.keys(cityData.wasteComposition).map(type => 
                type.charAt(0).toUpperCase() + type.slice(1)
            ),
            datasets: [{
                data: Object.values(cityData.wasteComposition),
                backgroundColor: [
                    '#FF6384',
                    '#36A2EB',
                    '#FFCE56',
                    '#4BC0C0',
                    '#9966FF'
                ],
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 15,
                hoverBorderWidth: 3
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                title: {
                    display: true,
                    text: 'Waste Composition in ' + cityData.city,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });

    // Recycling Rate Chart
    new Chart(recyclingCanvas.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: ['Recycled', 'Not Recycled'],
            datasets: [{
                data: [cityData.recyclingRate, 100 - cityData.recyclingRate],
                backgroundColor: ['#4CAF50', '#FF6384'],
                borderWidth: 2,
                borderColor: '#fff',
                hoverOffset: 15,
                hoverBorderWidth: 3
            }]
        },
        options: {
            ...commonOptions,
            plugins: {
                ...commonOptions.plugins,
                title: {
                    display: true,
                    text: 'Recycling Rate in ' + cityData.city,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: {
                        top: 10,
                        bottom: 20
                    }
                }
            },
            cutout: '60%',
            animation: {
                animateScale: true,
                animateRotate: true
            }
        }
    });

    // Add city statistics
    const statsDiv = document.createElement('div');
    statsDiv.className = 'city-stats';
    statsDiv.innerHTML = `
        <h3>${cityData.city} Waste Management Statistics</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <i class="fas fa-trash"></i>
                <h4>Total Waste</h4>
                <p>${cityData.totalWaste.toFixed(1)} tons/day</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-recycle"></i>
                <h4>Recycling Rate</h4>
                <p>${cityData.recyclingRate}%</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-users"></i>
                <h4>Population</h4>
                <p>${cityData.population.toLocaleString()}</p>
            </div>
            <div class="stat-card">
                <i class="fas fa-truck"></i>
                <h4>Collection Efficiency</h4>
                <p>${cityData.collectionEfficiency}%</p>
            </div>
        </div>
    `;
    graphContainer.appendChild(statsDiv);
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeCollectionCenters();
}); 