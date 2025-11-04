// Mock data for development and demonstration
export const mockMarketItems = [
  {
    _id: '1',
    name: 'Tomato',
    category: 'vegetable',
    unit: 'kg',
    description: 'Fresh red tomatoes',
    enabled: true,
    latestPrice: 120,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: '2',
    name: 'Onion',
    category: 'vegetable',
    unit: 'kg',
    description: 'White onions',
    enabled: true,
    latestPrice: 80,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: '3',
    name: 'Potato',
    category: 'vegetable',
    unit: 'kg',
    description: 'Fresh potatoes',
    enabled: true,
    latestPrice: 60,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: '4',
    name: 'Apple',
    category: 'fruit',
    unit: 'kg',
    description: 'Red apples',
    enabled: true,
    latestPrice: 200,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: '5',
    name: 'Mango',
    category: 'fruit',
    unit: 'kg',
    description: 'Sweet mangoes',
    enabled: true,
    latestPrice: 150,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: '6',
    name: 'Carrot',
    category: 'vegetable',
    unit: 'kg',
    description: 'Orange carrots',
    enabled: true,
    latestPrice: 90,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: '7',
    name: 'Banana',
    category: 'fruit',
    unit: 'dozen',
    description: 'Yellow bananas',
    enabled: true,
    latestPrice: 100,
    lastUpdated: new Date().toISOString(),
  },
  {
    _id: '8',
    name: 'Cauliflower',
    category: 'vegetable',
    unit: 'piece',
    description: 'White cauliflower',
    enabled: true,
    latestPrice: 40,
    lastUpdated: new Date().toISOString(),
  },
];

export const generateMockTrendData = (itemName, basePrice = 100) => {
  const data = [];
  const today = new Date();
  
  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    // Generate realistic price fluctuation
    const variation = (Math.random() - 0.5) * 0.3; // ±15% variation
    const dayTrend = Math.sin(i * 0.5) * 0.1; // Slight upward/downward trend
    const price = Math.round(basePrice * (1 + variation + dayTrend));
    
    data.push({
      date: date.toISOString().split('T')[0],
      price: price > 0 ? price : basePrice,
    });
  }
  
  return {
    item: { name: itemName },
    city: 'Lahore',
    data,
  };
};

export const mockWeatherData = {
  generatedAt: new Date().toISOString(),
  cities: [
    {
      city: 'Karachi',
      condition: 'Humid heatwave',
      temperature: 34,
      humidity: 68,
      precipitationChance: 12,
      category: 'heat',
      coordinates: { latitude: 24.8607, longitude: 67.0011 }
    },
    {
      city: 'Lahore',
      condition: 'Partly cloudy',
      temperature: 28,
      humidity: 55,
      precipitationChance: 25,
      category: 'cloudy',
      coordinates: { latitude: 31.5204, longitude: 74.3587 }
    },
    {
      city: 'Islamabad',
      condition: 'Clear sky',
      temperature: 26,
      humidity: 45,
      precipitationChance: 5,
      category: 'sunny',
      coordinates: { latitude: 33.6844, longitude: 73.0479 }
    },
    {
      city: 'Peshawar',
      condition: 'Light rain',
      temperature: 22,
      humidity: 75,
      precipitationChance: 80,
      category: 'rain',
      coordinates: { latitude: 34.0151, longitude: 71.5249 }
    },
    {
      city: 'Quetta',
      condition: 'Cold and dry',
      temperature: 15,
      humidity: 30,
      precipitationChance: 10,
      category: 'cold',
      coordinates: { latitude: 30.1798, longitude: 66.9750 }
    },
    {
      city: 'Multan',
      condition: 'Hot and sunny',
      temperature: 36,
      humidity: 40,
      precipitationChance: 8,
      category: 'heat',
      coordinates: { latitude: 30.1575, longitude: 71.5249 }
    }
  ]
};

export const mockForumPosts = [
  {
    _id: '1',
    title: 'Best time to plant wheat in Punjab?',
    content: 'I\'m planning to plant wheat this season. What\'s the optimal timing for Punjab region considering the current weather patterns?',
    author: { name: 'Ahmed Khan', username: 'ahmed_farmer' },
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '2',
    title: 'Tomato prices skyrocketing in Karachi',
    content: 'Has anyone noticed the sudden price increase in tomatoes? My usual buyers are offering much higher rates. Should I sell now or wait?',
    author: { name: 'Fatima Ali', username: 'fatima_crops' },
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '3',
    title: 'Organic farming techniques discussion',
    content: 'Looking to transition to organic farming. Would love to hear experiences from fellow farmers who have made this switch.',
    author: { name: 'Muhammad Hassan', username: 'hassan_organic' },
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    _id: '4',
    title: 'Water shortage affecting crop yield',
    content: 'The ongoing water shortage is severely impacting my crop yield. What are some water-efficient farming techniques you recommend?',
    author: { name: 'Aisha Malik', username: 'aisha_sustainable' },
    createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const mockAdviceData = {
  item: { name: 'Tomato' },
  city: 'Lahore',
  advice: [
    'Tomato prices rising (+15.2%) - consider selling soon',
    'Market demand for tomatoes is high in Lahore',
    'Rain expected - protect tomato crops from excess moisture',
    'Monitor Lahore market demand for tomatoes regularly'
  ]
};
