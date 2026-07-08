const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const { faker } = require("@faker-js/faker");

dotenv.config();

const User = require("./models/User");
const House = require("./models/House");
const Expense = require("./models/Expense");
const Maintenance = require("./models/Maintenance");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/roomiq";

const GENDERS = ["male", "female", "other"];
const SLEEP = ["early_bird", "night_owl", "flexible"];
const GUEST = ["never", "rarely", "sometimes", "often"];
const NOISE = ["silent", "low", "moderate", "high"];
const SMOKING = ["no_smoking", "outside_only", "anywhere"];
const PET = ["no_pets", "small_pets", "any_pets"];
const STUDY = ["at_home", "library", "mixed"];

const MODERN_HOUSE_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502005097973-ff5ce1e1466d?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1000&auto=format&fit=crop"
];

const generateUser = (passwordHash, overrides = {}) => {
  const gender = overrides.gender || faker.helpers.arrayElement(GENDERS);
  const firstName = faker.person.firstName(gender === 'other' ? undefined : gender);
  const lastName = faker.person.lastName();
  
  return {
    name: overrides.name || `${firstName} ${lastName}`,
    email: overrides.email || `${faker.string.alphanumeric(6)}.${faker.internet.email({ firstName, lastName }).toLowerCase()}`,
    password: passwordHash,
    phone: faker.phone.number(),
    bio: faker.person.bio(),
    avatar: overrides.avatar || faker.image.avatar(),
    occupation: faker.person.jobTitle(),
    gender: gender,
    budgetMax: faker.number.int({ min: 10000, max: 80000 }),
    compatibilityProfile: {
      sleepSchedule: faker.helpers.arrayElement(SLEEP),
      cleanlinessLevel: faker.number.int({ min: 1, max: 5 }),
      guestPolicy: faker.helpers.arrayElement(GUEST),
      noiseTolerance: faker.helpers.arrayElement(NOISE),
      smokingPolicy: faker.helpers.arrayElement(SMOKING),
      petPolicy: faker.helpers.arrayElement(PET),
      studyHabits: faker.helpers.arrayElement(STUDY),
      foodSharing: faker.datatype.boolean(),
      completedAt: faker.date.past()
    },
    ...overrides
  };
};

const seed = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB...");

    console.log("Flushing database...");
    await Promise.all([
      User.deleteMany({}), House.deleteMany({}), Expense.deleteMany({}),
      Maintenance.deleteMany({})
    ]);

    const freeAgentsData = Array.from({ length: 15 }).map(() => generateUser("password123"));
    await Promise.all(freeAgentsData.map(u => User.create(u)));

    console.log("Generating Main Demo House (Rafiq's Home)...");
    
    // Rafiq + 4 specific members
    const rafiq = await User.create(generateUser("password123", {
      name: "Rafiq Ahmed",
      email: "rafiq@test.com",
      gender: "male",
      budgetMax: 30000,
      occupation: "Software Engineer",
      avatar: "https://i.pravatar.cc/150?u=rafiq"
    }));

    const aisha = await User.create(generateUser("password123", {
      name: "Aisha Khan", email: "aisha@test.com", gender: "female", occupation: "Marketing Manager", avatar: "https://i.pravatar.cc/150?u=aisha"
    }));
    
    const farhan = await User.create(generateUser("password123", {
      name: "Farhan Rahman", email: "farhan@test.com", gender: "male", occupation: "Graphic Designer", avatar: "https://i.pravatar.cc/150?u=farhan"
    }));

    const zara = await User.create(generateUser("password123", {
      name: "Zara Islam", email: "zara@test.com", gender: "female", occupation: "Architecture Student", avatar: "https://i.pravatar.cc/150?u=zara"
    }));

    const kamil = await User.create(generateUser("password123", {
      name: "Kamil Hossain", email: "kamil@test.com", gender: "male", occupation: "Medical Resident", avatar: "https://i.pravatar.cc/150?u=kamil"
    }));

    const demoMembers = [rafiq, aisha, farhan, zara, kamil];

    const rafiqHouse = await House.create({
      name: "Rafiq's Home",
      address: "123 Gulshan Avenue, Dhaka",
      totalRooms: 5,
      monthlyRent: 85000,
      inviteCode: "RAFIQ123",
      maxMembers: 5,
      isPublic: true,
      images: [MODERN_HOUSE_IMAGES[0], MODERN_HOUSE_IMAGES[1]],
      members: demoMembers.map((u, i) => ({ user: u._id, role: i === 0 ? "admin" : "member" }))
    });

    await User.updateMany(
      { _id: { $in: demoMembers.map(u => u._id) } },
      { currentHouse: rafiqHouse._id }
    );

    console.log("Generating 9 other realistic public houses...");
    for (let h = 1; h < 10; h++) {
      const numMembers = faker.number.int({ min: 2, max: 4 });
      const members = [];
      for (let i = 0; i < numMembers; i++) {
        members.push(await User.create(generateUser("password123")));
      }

      const house = await House.create({
        name: `${faker.location.street()} Apartment`,
        address: faker.location.streetAddress(),
        totalRooms: numMembers + faker.number.int({ min: 1, max: 2 }),
        monthlyRent: faker.number.int({ min: 20000, max: 80000 }),
        inviteCode: faker.string.alphanumeric(8).toUpperCase(),
        maxMembers: numMembers + 2,
        isPublic: true,
        images: [MODERN_HOUSE_IMAGES[h]],
        members: members.map((u, i) => ({ user: u._id, role: i === 0 ? "admin" : "member" }))
      });

      await User.updateMany(
        { _id: { $in: members.map(u => u._id) } },
        { currentHouse: house._id }
      );
    }

    console.log("Populating Rafiq's Home with rich feature data...");
    
    // --- FINANCES (Some paid, some owed) ---
    await Expense.create({
      house: rafiqHouse._id,
      title: "July Rent",
      totalAmount: 85000,
      category: "rent",
      paidBy: rafiq._id,
      splitType: "equal",
      splits: demoMembers.map(m => ({
        user: m._id,
        amount: 85000 / 5,
        isPaid: m._id.toString() === rafiq._id.toString() || m._id.toString() === aisha._id.toString() 
      })),
      date: new Date()
    });

    await Expense.create({
      house: rafiqHouse._id,
      title: "Weekly Groceries",
      totalAmount: 5000,
      category: "groceries",
      paidBy: farhan._id,
      splitType: "equal",
      splits: demoMembers.map(m => ({
        user: m._id,
        amount: 1000,
        isPaid: m._id.toString() === farhan._id.toString()
      })),
      date: faker.date.recent({ days: 5 })
    });

    await Expense.create({
      house: rafiqHouse._id,
      title: "High-Speed Internet Bill",
      totalAmount: 2000,
      category: "internet",
      paidBy: kamil._id,
      splitType: "equal",
      splits: demoMembers.map(m => ({
        user: m._id,
        amount: 400,
        isPaid: m._id.toString() === kamil._id.toString() || m._id.toString() === zara._id.toString()
      })),
      date: faker.date.recent({ days: 2 })
    });

    await Expense.create({
      house: rafiqHouse._id,
      title: "Electric Bill (June)",
      totalAmount: 6500,
      category: "electricity",
      paidBy: aisha._id,
      splitType: "equal",
      splits: demoMembers.map(m => ({
        user: m._id,
        amount: 1300,
        isPaid: true // Fully settled!
      })),
      date: faker.date.recent({ days: 15 })
    });

    // --- MAINTENANCE ---
    await Maintenance.create({
      house: rafiqHouse._id,
      title: "Leaky Faucet in Guest Bathroom",
      description: "Dripping constantly, needs a new washer.",
      reportedBy: rafiq._id,
      category: "plumbing",
      priority: "medium",
      status: "reported",
      image: "https://images.unsplash.com/photo-1585058178811-6677fbb44026?w=500&auto=format&fit=crop"
    });

    await Maintenance.create({
      house: rafiqHouse._id,
      title: "AC not cooling in living room",
      description: "Blowing warm air only. Need to call the technician.",
      reportedBy: zara._id,
      category: "appliance",
      priority: "high",
      status: "in_progress",
    });

    await Maintenance.create({
      house: rafiqHouse._id,
      title: "Broken Cabinet Door",
      description: "The hinge on the top left kitchen cabinet broke.",
      reportedBy: aisha._id,
      category: "structural",
      priority: "low",
      status: "resolved",
    });

    console.log("------------------------------------------");
    console.log("SEEDING COMPLETE!");
    console.log("Total Houses: 10");
    console.log("Total Free Agents: 15");
    console.log("Main Demo House: Rafiq's Home (5 members)");
    console.log("Direct Logins available (all password123):");
    console.log("  - rafiq@test.com");
    console.log("  - aisha@test.com");
    console.log("  - farhan@test.com");
    console.log("  - zara@test.com");
    console.log("  - kamil@test.com");
    process.exit(0);

  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
