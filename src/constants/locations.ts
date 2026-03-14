export const NEPAL_DISTRICTS = [
  "Achham", "Arghakhanchi", "Baglung", "Baitadi", "Bajhang", "Bajura", "Banke", "Bara", "Bardiya", "Bhaktapur",
  "Bhojpur", "Chitwan", "Dadeldhura", "Dailekh", "Dang", "Darchula", "Dhading", "Dhankuta", "Dhanusa", "Dolakha",
  "Dolpa", "Doti", "Gorkha", "Gulmi", "Humla", "Ilam", "Jajarkot", "Jhapa", "Jumla", "Kailali", "Kalikot",
  "Kanchanpur", "Kapilvastu", "Kaski", "Kathmandu", "Kavrepalanchok", "Khotang", "Lalitpur", "Lamjung", "Mahottari",
  "Makwanpur", "Manang", "Mustang", "Mugu", "Myagdi", "Nawalpur", "Parasi", "Nuwakot", "Okhaldhunga", "Palpa",
  "Panchthar", "Parbat", "Parsa", "Pyuthan", "Ramechhap", "Rasuwa", "Rautahat", "Rolpa", "Rukum East", "Rukum West",
  "Rupandehi", "Salyan", "Sankhuwasabha", "Saptari", "Sarlahi", "Sindhuli", "Sindhupalchok", "Siraha", "Solukhumbu",
  "Sunsari", "Surkhet", "Syangja", "Tanahu", "Taplejung", "Terhathum", "Udayapur"
];

export const NEPAL_CITIES = [
  "Kathmandu", "Pokhara", "Lalitpur", "Bharatpur", "Biratnagar", "Birgunj", "Janakpur", "Ghorahi", "Hetauda", 
  "Dhangadhi", "Itahari", "Dharan", "Butwal", "Nepalgunj", "Tulsipur", "Kalaiya", "Jeetpur Simara", "Mechinagar", 
  "Ghodaghodi", "Bhemdatt", "Damak", "Birtamod", "Lahan", "Tikapur", "Gulariya", "Gaushala", "Inaruwa", "Khandbari",
  "Dhankuta", "Bhojpur", "Ilam", "Bhadrapur", "Kakarbhitta", "Besisahar", "Baglung", "Tansen", "Sandhikharka",
  "Tamghas", "Putalibazar", "Damauli", "Kushma", "Beni", "Gorkha", "Chautara", "Dhulikhel", "Panauti", "Banepa",
  "Bidur", "Nilkantha", "Charikot", "Kamalamai", "Malangwa", "Jaleshwar", "Gaur", "Kalaiya", "Taulihawa",
  "Siddharthanagar", "Ramgram", "Gulariya", "Kohalpur", "Birendranagar", "Dailekh", "Salyan", "Libang", "Jumla",
  "Dipayal Silgadhi", "Mangalsen", "Chainpur", "Darchula", "Baitadi", "Amargadhi"
];

export const ALL_NEPAL_LOCATIONS = [...new Set([...NEPAL_DISTRICTS, ...NEPAL_CITIES])].sort();
