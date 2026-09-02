const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

dotenv.config();

const User = require("./models/User");
const House = require("./models/House");
const Expense = require("./models/Expense");
const Chore = require("./models/Chore");
const Maintenance = require("./models/Maintenance");
const { ShoppingItem, InventoryItem } = require("./models/Shopping");
const Rule = require("./models/Rule");
const Notice = require("./models/Notice");
const Complaint = require("./models/Complaint");
const Activity = require("./models/Activity");
const Message = require("./models/Message");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/roomiq";

const HOUSE_IMAGES = [
  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1502672260266-1c1de2d9d000?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1484154218962-a197022b5858?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1000&auto=format&fit=crop"
];

async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB:", MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB successfully.");

    console.log("🧹 Flushing existing database collections...");
    await Promise.all([
      User.deleteMany({}),
      House.deleteMany({}),
      Expense.deleteMany({}),
      Chore.deleteMany({}),
      Maintenance.deleteMany({}),
      ShoppingItem.deleteMany({}),
      InventoryItem.deleteMany({}),
      Rule.deleteMany({}),
      Notice.deleteMany({}),
      Complaint.deleteMany({}),
      Activity.deleteMany({}),
      Message.deleteMany({})
    ]);
    console.log("✨ All previous data cleared.");

    // -------------------------------------------------------------
    // 1. CREATE CORE HOUSE RESIDENTS (Rafiq's House)
    // -------------------------------------------------------------
    console.log("👥 Creating core house members...");
    
    // Hash password once
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash("password123", salt);

    const rafiq = await User.create({
      name: "Rafiq Ahmed",
      email: "rafiq@test.com",
      password: "password123",
      phone: "+8801711122334",
      bio: "Software Engineer at a tech startup. Loves clean code, coffee, and quiet weekends.",
      occupation: "Software Engineer",
      gender: "male",
      budgetMax: 35000,
      bkashNumber: "01711122334",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=400&auto=format&fit=crop",
      compatibilityProfile: {
        sleepSchedule: "early_bird",
        cleanlinessLevel: 5,
        guestPolicy: "rarely",
        noiseTolerance: "low",
        smokingPolicy: "no_smoking",
        petPolicy: "no_pets",
        studyHabits: "at_home",
        foodSharing: false,
        completedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      }
    });

    const aisha = await User.create({
      name: "Aisha Khan",
      email: "aisha@test.com",
      password: "password123",
      phone: "+8801822233445",
      bio: "Marketing strategist. Coffee lover, loves indoor plants and organizing house events.",
      occupation: "Marketing Lead",
      gender: "female",
      budgetMax: 30000,
      bkashNumber: "01822233445",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=400&auto=format&fit=crop",
      compatibilityProfile: {
        sleepSchedule: "flexible",
        cleanlinessLevel: 4,
        guestPolicy: "sometimes",
        noiseTolerance: "moderate",
        smokingPolicy: "no_smoking",
        petPolicy: "small_pets",
        studyHabits: "mixed",
        foodSharing: true,
        completedAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000)
      }
    });

    const farhan = await User.create({
      name: "Farhan Rahman",
      email: "farhan@test.com",
      password: "password123",
      phone: "+8801933344556",
      bio: "UI/UX Designer and gamer. Works late hours, respectful and quiet in common areas.",
      occupation: "Product Designer",
      gender: "male",
      budgetMax: 28000,
      bkashNumber: "01933344556",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop",
      compatibilityProfile: {
        sleepSchedule: "night_owl",
        cleanlinessLevel: 3,
        guestPolicy: "sometimes",
        noiseTolerance: "high",
        smokingPolicy: "outside_only",
        petPolicy: "any_pets",
        studyHabits: "at_home",
        foodSharing: true,
        completedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000)
      }
    });

    const zara = await User.create({
      name: "Zara Hossain",
      email: "zara@test.com",
      password: "password123",
      phone: "+8801644455667",
      bio: "Architecture graduate. Big fan of aesthetic spaces and weekend cooking experiments.",
      occupation: "Architect",
      gender: "female",
      budgetMax: 32000,
      bkashNumber: "01644455667",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop",
      compatibilityProfile: {
        sleepSchedule: "early_bird",
        cleanlinessLevel: 5,
        guestPolicy: "rarely",
        noiseTolerance: "low",
        smokingPolicy: "no_smoking",
        petPolicy: "small_pets",
        studyHabits: "at_home",
        foodSharing: false,
        completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
      }
    });

    const tanvir = await User.create({
      name: "Tanvir Hasan",
      email: "tanvir@test.com",
      password: "password123",
      phone: "+8801555566778",
      bio: "Undergrad CS student. Quiet, focused on studies, likes keeping shared spaces organized.",
      occupation: "Student",
      gender: "male",
      budgetMax: 20000,
      bkashNumber: "01555566778",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop",
      compatibilityProfile: {
        sleepSchedule: "night_owl",
        cleanlinessLevel: 4,
        guestPolicy: "never",
        noiseTolerance: "moderate",
        smokingPolicy: "no_smoking",
        petPolicy: "no_pets",
        studyHabits: "library",
        foodSharing: false,
        completedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000)
      }
    });

    // -------------------------------------------------------------
    // 2. CREATE FREE AGENT ROOMMATES (Find Roommates & Matching)
    // -------------------------------------------------------------
    console.log("🔍 Creating prospective roommates for matching...");
    
    const kamil = await User.create({
      name: "Kamil Chowdhury",
      email: "kamil@test.com",
      password: "password123",
      phone: "+8801777788990",
      bio: "Finance analyst looking for clean, quiet flatmates in Banani/Gulshan area.",
      occupation: "Financial Analyst",
      gender: "male",
      budgetMax: 30000,
      bkashNumber: "01777788990",
      avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=400&auto=format&fit=crop",
      compatibilityProfile: {
        sleepSchedule: "early_bird",
        cleanlinessLevel: 5,
        guestPolicy: "rarely",
        noiseTolerance: "silent",
        smokingPolicy: "no_smoking",
        petPolicy: "no_pets",
        studyHabits: "at_home",
        foodSharing: false,
        completedAt: new Date()
      }
    });

    const nabila = await User.create({
      name: "Nabila Islam",
      email: "nabila@test.com",
      password: "password123",
      phone: "+8801811122334",
      bio: "Medical resident at BIRDEM. Looking for peaceful environment near Dhanmondi.",
      occupation: "Doctor / Resident",
      gender: "female",
      budgetMax: 35000,
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=400&auto=format&fit=crop",
      compatibilityProfile: {
        sleepSchedule: "flexible",
        cleanlinessLevel: 5,
        guestPolicy: "never",
        noiseTolerance: "low",
        smokingPolicy: "no_smoking",
        petPolicy: "no_pets",
        studyHabits: "at_home",
        foodSharing: false,
        completedAt: new Date()
      }
    });

    const siam = await User.create({
      name: "Siam Ahmed",
      email: "siam@test.com",
      password: "password123",
      phone: "+8801622233445",
      bio: "Frontend Developer and photographer. Loves music, casual chats and gaming.",
      occupation: "Frontend Engineer",
      gender: "male",
      budgetMax: 25000,
      avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=400&auto=format&fit=crop",
      compatibilityProfile: {
        sleepSchedule: "night_owl",
        cleanlinessLevel: 3,
        guestPolicy: "sometimes",
        noiseTolerance: "high",
        smokingPolicy: "outside_only",
        petPolicy: "any_pets",
        studyHabits: "mixed",
        foodSharing: true,
        completedAt: new Date()
      }
    });

    const sadia = await User.create({
      name: "Sadia Sultana",
      email: "sadia@test.com",
      password: "password123",
      phone: "+8801944455667",
      bio: "Data Scientist. Work from home enthusiast, non-smoker, loves plants.",
      occupation: "Data Scientist",
      gender: "female",
      budgetMax: 40000,
      avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop",
      compatibilityProfile: {
        sleepSchedule: "early_bird",
        cleanlinessLevel: 4,
        guestPolicy: "rarely",
        noiseTolerance: "low",
        smokingPolicy: "no_smoking",
        petPolicy: "small_pets",
        studyHabits: "at_home",
        foodSharing: false,
        completedAt: new Date()
      }
    });

    // -------------------------------------------------------------
    // 3. CREATE MAIN DEMO HOUSE (Mirpur Nest)
    // -------------------------------------------------------------
    console.log("🏠 Creating Main Demo House (Mirpur Nest)...");
    
    const mainHouse = await House.create({
      name: "Mirpur Nest",
      address: "House 24, Road 7, Block C, Mirpur-2, Dhaka",
      totalRooms: 4,
      monthlyRent: 36000,
      inviteCode: "NEST24",
      maxMembers: 6,
      currency: "BDT",
      isActive: true,
      isPublic: true,
      images: [HOUSE_IMAGES[0], HOUSE_IMAGES[1], HOUSE_IMAGES[2], HOUSE_IMAGES[3]],
      members: [
        { user: rafiq._id, role: "admin", joinedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000) },
        { user: aisha._id, role: "member", joinedAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000) },
        { user: farhan._id, role: "member", joinedAt: new Date(Date.now() - 50 * 24 * 60 * 60 * 1000) },
        { user: zara._id, role: "member", joinedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000) },
        { user: tanvir._id, role: "member", joinedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) }
      ]
    });

    // Assign currentHouse to residents
    await User.updateMany(
      { _id: { $in: [rafiq._id, aisha._id, farhan._id, zara._id, tanvir._id] } },
      { currentHouse: mainHouse._id }
    );

    // -------------------------------------------------------------
    // 4. CREATE OTHER PUBLIC HOUSES (Discover Houses)
    // -------------------------------------------------------------
    console.log("🏘️ Creating public house listings for Discovery...");
    
    await House.create([
      {
        name: "Gulshan Skyview Residence",
        address: "Apartment 11B, Road 113, Gulshan-2, Dhaka",
        totalRooms: 5,
        monthlyRent: 75000,
        inviteCode: "GLSH05",
        maxMembers: 5,
        currency: "BDT",
        isPublic: true,
        images: [HOUSE_IMAGES[4], HOUSE_IMAGES[5], HOUSE_IMAGES[6]],
        members: [{ user: sadia._id, role: "admin", joinedAt: new Date() }]
      },
      {
        name: "Dhanmondi Green Villa",
        address: "House 45, Road 8A, Dhanmondi, Dhaka",
        totalRooms: 3,
        monthlyRent: 42000,
        inviteCode: "DHAN03",
        maxMembers: 4,
        currency: "BDT",
        isPublic: true,
        images: [HOUSE_IMAGES[1], HOUSE_IMAGES[3]],
        members: [{ user: nabila._id, role: "admin", joinedAt: new Date() }]
      },
      {
        name: "Banani Urban Studio",
        address: "Flat 4A, Road 11, Block D, Banani, Dhaka",
        totalRooms: 4,
        monthlyRent: 55000,
        inviteCode: "BANI04",
        maxMembers: 4,
        currency: "BDT",
        isPublic: true,
        images: [HOUSE_IMAGES[2], HOUSE_IMAGES[0]],
        members: [{ user: kamil._id, role: "admin", joinedAt: new Date() }]
      },
      {
        name: "Bashundhara Student Hub",
        address: "House 12, Block D, Bashundhara R/A, Dhaka",
        totalRooms: 6,
        monthlyRent: 48000,
        inviteCode: "BASH06",
        maxMembers: 6,
        currency: "BDT",
        isPublic: true,
        images: [HOUSE_IMAGES[5], HOUSE_IMAGES[2]],
        members: [{ user: siam._id, role: "admin", joinedAt: new Date() }]
      }
    ]);

    // -------------------------------------------------------------
    // 5. SEED EXPENSES & DEBT BALANCES (Features 11, 12, 13, 14)
    // -------------------------------------------------------------
    console.log("💰 Seeding shared expenses and balances...");

    // Equal 5-way split helpers
    const members = [rafiq, aisha, farhan, zara, tanvir];
    const split5 = (total) => {
      const share = Math.round(total / 5);
      return members.map(m => ({
        user: m._id,
        amount: share,
        status: m._id.toString() === rafiq._id.toString() ? "paid" : "unpaid",
        paymentMethod: "bkash",
        isPaid: m._id.toString() === rafiq._id.toString(),
        paidAt: m._id.toString() === rafiq._id.toString() ? new Date() : null
      }));
    };

    // 1. Monthly Rent (Recurring)
    await Expense.create({
      house: mainHouse._id,
      title: "August Monthly Apartment Rent",
      totalAmount: 36000,
      category: "rent",
      paidBy: rafiq._id,
      splitType: "equal",
      isRecurring: true,
      recurringDay: 1,
      note: "Paid directly to building owner via bank transfer.",
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      splits: members.map(m => ({
        user: m._id,
        amount: 7200,
        status: m._id.toString() === rafiq._id.toString() ? "paid" : m._id.toString() === aisha._id.toString() ? "paid" : "unpaid",
        paymentMethod: "bkash",
        isPaid: m._id.toString() === rafiq._id.toString() || m._id.toString() === aisha._id.toString(),
        paidAt: m._id.toString() === rafiq._id.toString() || m._id.toString() === aisha._id.toString() ? new Date() : null
      }))
    });

    // 2. High-Speed Fiber Internet
    await Expense.create({
      house: mainHouse._id,
      title: "Dot Internet 60 Mbps Monthly Bill",
      totalAmount: 2500,
      category: "internet",
      paidBy: aisha._id,
      splitType: "equal",
      note: "Receipt attached from Dot ISP portal.",
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      splits: members.map(m => ({
        user: m._id,
        amount: 500,
        status: m._id.toString() === aisha._id.toString() ? "paid" : "unpaid",
        paymentMethod: "bkash",
        isPaid: m._id.toString() === aisha._id.toString(),
        paidAt: m._id.toString() === aisha._id.toString() ? new Date() : null
      }))
    });

    // 3. Weekly Supermarket Groceries
    await Expense.create({
      house: mainHouse._id,
      title: "Shwapno Weekly Communal Groceries",
      totalAmount: 4850,
      category: "groceries",
      paidBy: farhan._id,
      splitType: "equal",
      note: "Cooking oil, spices, laundry detergent, eggs, snacks.",
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      splits: members.map(m => ({
        user: m._id,
        amount: 970,
        status: m._id.toString() === farhan._id.toString() ? "paid" : "unpaid",
        paymentMethod: "cash",
        isPaid: m._id.toString() === farhan._id.toString(),
        paidAt: m._id.toString() === farhan._id.toString() ? new Date() : null
      }))
    });

    // 4. Electricity DESCO Bill
    await Expense.create({
      house: mainHouse._id,
      title: "DESCO Postpaid Electricity Bill",
      totalAmount: 5400,
      category: "electricity",
      paidBy: zara._id,
      splitType: "equal",
      note: "Summer AC consumption included.",
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      splits: members.map(m => ({
        user: m._id,
        amount: 1080,
        status: m._id.toString() === zara._id.toString() ? "paid" : "unpaid",
        paymentMethod: "bkash",
        isPaid: m._id.toString() === zara._id.toString(),
        paidAt: m._id.toString() === zara._id.toString() ? new Date() : null
      }))
    });

    // 5. Maintenance Auto-Split (Resolved Repair)
    await Expense.create({
      house: mainHouse._id,
      title: "Plumbing Repair: Kitchen Pipe Leak Fix",
      totalAmount: 1800,
      category: "maintenance",
      paidBy: rafiq._id,
      splitType: "equal",
      note: "Auto-split from resolved maintenance ticket #PIPE-FIX.",
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      splits: members.map(m => ({
        user: m._id,
        amount: 360,
        status: m._id.toString() === rafiq._id.toString() ? "paid" : "unpaid",
        paymentMethod: "bkash",
        isPaid: m._id.toString() === rafiq._id.toString(),
        paidAt: m._id.toString() === rafiq._id.toString() ? new Date() : null
      }))
    });

    // -------------------------------------------------------------
    // 6. SEED CHORES & ROTATIONS (Features 16, 17, 18)
    // -------------------------------------------------------------
    console.log("🧹 Seeding chores and rotation history...");

    // 1. Kitchen Deep Clean (Pending, Assigned to Rafiq)
    await Chore.create({
      house: mainHouse._id,
      title: "Kitchen Deep Cleaning & Countertop Sanitization",
      description: "Clean stovetop, microwave, countertops, and take out organic trash.",
      assignedTo: rafiq._id,
      rotationOrder: [rafiq._id, aisha._id, farhan._id, zara._id, tanvir._id],
      isAutoRotate: true,
      rotationFrequency: "weekly",
      status: "pending",
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      completionHistory: [
        { user: zara._id, completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), onTime: true },
        { user: farhan._id, completedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000), onTime: true }
      ]
    });

    // 2. Living Room Vacuuming (Pending, Assigned to Aisha)
    await Chore.create({
      house: mainHouse._id,
      title: "Living Room Vacuuming & Dusting",
      description: "Vacuum sofa cushions, main carpet, and wipe TV console.",
      assignedTo: aisha._id,
      rotationOrder: [aisha._id, farhan._id, zara._id, tanvir._id, rafiq._id],
      isAutoRotate: true,
      rotationFrequency: "weekly",
      status: "pending",
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      completionHistory: [
        { user: aisha._id, completedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), onTime: true },
        { user: rafiq._id, completedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), onTime: true }
      ]
    });

    // 3. Trash & Recycling (Overdue, Assigned to Farhan)
    await Chore.create({
      house: mainHouse._id,
      title: "Take Out Main Trash & Sort Plastic Recycling",
      description: "Empty all bin liners into the ground floor dumpster.",
      assignedTo: farhan._id,
      rotationOrder: [farhan._id, zara._id, tanvir._id, rafiq._id, aisha._id],
      isAutoRotate: true,
      rotationFrequency: "daily",
      status: "pending",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) // Overdue!
    });

    // 4. Bathroom Scrubbing (Done)
    await Chore.create({
      house: mainHouse._id,
      title: "Common Bathroom Deep Scrub",
      description: "Disinfect toilet, shower glass, and clean floor tiles with Harpic.",
      assignedTo: zara._id,
      rotationOrder: [zara._id, tanvir._id, rafiq._id, aisha._id, farhan._id],
      isAutoRotate: true,
      rotationFrequency: "weekly",
      status: "done",
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      completionHistory: [
        { user: zara._id, completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), onTime: true },
        { user: tanvir._id, completedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), onTime: true },
        { user: rafiq._id, completedAt: new Date(Date.now() - 16 * 24 * 60 * 60 * 1000), onTime: true },
        { user: aisha._id, completedAt: new Date(Date.now() - 23 * 24 * 60 * 60 * 1000), onTime: true }
      ]
    });

    // 5. Balcony Plants Care (Done)
    await Chore.create({
      house: mainHouse._id,
      title: "Water Balcony Plants & Clean Planter Trays",
      description: "Water all potted plants and trim yellowing leaves.",
      assignedTo: aisha._id,
      rotationOrder: [aisha._id, rafiq._id],
      isAutoRotate: false,
      status: "done",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      completionHistory: [
        { user: aisha._id, completedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), onTime: true }
      ]
    });

    // 6. Dishes & Dishrack (Disputed)
    await Chore.create({
      house: mainHouse._id,
      title: "Clean Sink & Organize Drying Rack",
      description: "Wash remaining pans and clear the dish drainer.",
      assignedTo: tanvir._id,
      status: "disputed",
      dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      dispute: {
        raisedBy: farhan._id,
        reason: "Dishes were marked done but greasy frying pan was left soaking in the sink.",
        status: "open",
        raisedAt: new Date()
      }
    });

    // -------------------------------------------------------------
    // 7. SEED MAINTENANCE REQUESTS (Features 19, 20)
    // -------------------------------------------------------------
    console.log("🔧 Seeding maintenance tickets...");

    // 1. Resolved with Auto-Split
    await Maintenance.create({
      house: mainHouse._id,
      title: "Kitchen Sink Pipe Joint Leakage",
      description: "The PVC joint beneath the main double basin cracked, causing water seepage on the floor.",
      reportedBy: rafiq._id,
      category: "plumbing",
      priority: "high",
      status: "resolved",
      imageUrl: "https://images.unsplash.com/photo-1585704032915-c3400ca199e7?q=80&w=600&auto=format&fit=crop",
      resolvedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      statusHistory: [
        { status: "reported", updatedBy: rafiq._id, note: "Reported leakage under kitchen sink.", updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
        { status: "in_progress", updatedBy: rafiq._id, note: "Plumber called; replacement PVC pipe purchased.", updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: "resolved", updatedBy: rafiq._id, note: "Fixed and tested with full water flow. Split ৳1,800 equally.", updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
      ]
    });

    // 2. In Progress (AC repair)
    await Maintenance.create({
      house: mainHouse._id,
      title: "Master Bedroom Gree AC Gas Refill Required",
      description: "AC blower runs normally but does not produce cold air. Technician diagnosed low refrigerant pressure.",
      reportedBy: aisha._id,
      category: "appliance",
      priority: "urgent",
      status: "in_progress",
      imageUrl: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?q=80&w=600&auto=format&fit=crop",
      statusHistory: [
        { status: "reported", updatedBy: aisha._id, note: "AC blowing ambient air only.", updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) },
        { status: "acknowledged", updatedBy: rafiq._id, note: "Contacted Gree authorized service center.", updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: "in_progress", updatedBy: rafiq._id, note: "Technician arriving tomorrow between 2 PM - 4 PM.", updatedAt: new Date() }
      ]
    });

    // 3. Acknowledged (Balcony Light)
    await Maintenance.create({
      house: mainHouse._id,
      title: "Balcony Ceiling LED Fixture Flickering",
      description: "The ceiling fixture flickers constantly when switched on. Probably needs driver or bulb replacement.",
      reportedBy: farhan._id,
      category: "electrical",
      priority: "low",
      status: "acknowledged",
      statusHistory: [
        { status: "reported", updatedBy: farhan._id, note: "LED fixture loose connection.", updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
        { status: "acknowledged", updatedBy: rafiq._id, note: "Will buy new Philips 12W LED bulb on next grocery run.", updatedAt: new Date() }
      ]
    });

    // -------------------------------------------------------------
    // 8. SEED GROCERIES & INVENTORY (Shopping)
    // -------------------------------------------------------------
    console.log("🛒 Seeding groceries checklist and pantry inventory...");

    await ShoppingItem.create([
      { house: mainHouse._id, name: "Pran Full Cream Liquid Milk (2L)", quantity: 2, unit: "liters", category: "groceries", addedBy: rafiq._id, claimedBy: aisha._id },
      { house: mainHouse._id, name: "Farm Fresh Eggs (Brown)", quantity: 1, unit: "dozen", category: "groceries", addedBy: aisha._id },
      { house: mainHouse._id, name: "Vim Dishwashing Gel & Scrubbers", quantity: 1, unit: "bottle", category: "cleaning", addedBy: farhan._id },
      { house: mainHouse._id, name: "Fresh Filter Coffee Grounds", quantity: 500, unit: "grams", category: "kitchen", addedBy: zara._id },
      { house: mainHouse._id, name: "Heavy Duty Garbage Bags (Large)", quantity: 2, unit: "packs", category: "cleaning", addedBy: tanvir._id, isBought: true, boughtBy: rafiq._id, cost: 240, boughtAt: new Date() }
    ]);

    await InventoryItem.create([
      { house: mainHouse._id, name: "Miniket Rice (Polished)", currentQuantity: 4, unit: "kg", lowStockThreshold: 5, category: "groceries", lastRestockedBy: rafiq._id, lastRestockedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { house: mainHouse._id, name: "Dettol Liquid Handwash", currentQuantity: 1, unit: "refill pack", lowStockThreshold: 2, category: "toiletries", lastRestockedBy: aisha._id, lastRestockedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { house: mainHouse._id, name: "Toilet Paper Rolls", currentQuantity: 2, unit: "rolls", lowStockThreshold: 3, category: "toiletries" },
      { house: mainHouse._id, name: "Teer Fortified Soybean Oil", currentQuantity: 5, unit: "liters", lowStockThreshold: 2, category: "groceries", lastRestockedBy: farhan._id, lastRestockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
      { house: mainHouse._id, name: "Harpic Power Plus Disinfectant", currentQuantity: 2, unit: "bottles", lowStockThreshold: 1, category: "cleaning" }
    ]);

    // -------------------------------------------------------------
    // 9. SEED DEMOCRATIC HOUSE RULES & VOTES (Feature 7)
    // -------------------------------------------------------------
    console.log("📜 Seeding house rules and active ballots...");

    await Rule.create([
      {
        house: mainHouse._id,
        title: "Quiet hours observed strictly after 11:00 PM on weekdays",
        description: "Headphones required for music, gaming, and calls in shared areas between 11 PM and 7 AM.",
        proposedBy: rafiq._id,
        category: "noise",
        status: "active",
        votingDeadline: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 29 * 24 * 60 * 60 * 1000),
        votes: [
          { user: rafiq._id, vote: "yes" },
          { user: aisha._id, vote: "yes" },
          { user: farhan._id, vote: "yes" },
          { user: zara._id, vote: "yes" },
          { user: tanvir._id, vote: "yes" }
        ]
      },
      {
        house: mainHouse._id,
        title: "No outdoor shoes past the entryway shoe cabinet",
        description: "All footwear must be placed inside the shoe rack upon entering the main apartment door.",
        proposedBy: zara._id,
        category: "cleanliness",
        status: "active",
        votingDeadline: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
        approvedAt: new Date(Date.now() - 19 * 24 * 60 * 60 * 1000),
        votes: [
          { user: rafiq._id, vote: "yes" },
          { user: aisha._id, vote: "yes" },
          { user: zara._id, vote: "yes" },
          { user: tanvir._id, vote: "yes" }
        ]
      },
      {
        house: mainHouse._id,
        title: "Weekend overnight guests must be notified 24 hours in advance",
        description: "Post in the house group before hosting friends overnight to maintain comfort and safety.",
        proposedBy: aisha._id,
        category: "guests",
        status: "voting",
        votingDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Voting open!
        votes: [
          { user: aisha._id, vote: "yes" },
          { user: rafiq._id, vote: "yes" },
          { user: farhan._id, vote: "no" }
        ]
      },
      {
        house: mainHouse._id,
        title: "Allow cigarette smoking inside private bedrooms with open window",
        description: "Allow indoor smoking if the exhaust fan is running.",
        proposedBy: farhan._id,
        category: "general",
        status: "rejected",
        votingDeadline: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        votes: [
          { user: farhan._id, vote: "yes" },
          { user: rafiq._id, vote: "no" },
          { user: aisha._id, vote: "no" },
          { user: zara._id, vote: "no" },
          { user: tanvir._id, vote: "no" }
        ]
      }
    ]);

    // -------------------------------------------------------------
    // 10. SEED NOTICEBOARD ANNOUNCEMENTS (Feature 8)
    // -------------------------------------------------------------
    console.log("📌 Seeding noticeboard announcements...");

    await Notice.create([
      {
        house: mainHouse._id,
        title: "Overhead Water Tank Cleaning This Saturday at 10:00 AM",
        body: "Building caretaker confirmed main water supply will be temporarily turned off between 10 AM and 1 PM. Please store sufficient water in advance.",
        postedBy: rafiq._id,
        category: "announcement",
        isPinned: true,
        expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
      },
      {
        house: mainHouse._id,
        title: "Monthly Rent & Utility Settlement Due by 28th",
        body: "Please check your net balances on the Finance tab and settle outstanding amounts via bKash by the 28th of this month.",
        postedBy: rafiq._id,
        category: "reminder",
        isPinned: false,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      },
      {
        house: mainHouse._id,
        title: "House Potluck & Movie Night on Friday! 🍕🎬",
        body: "Let's do a house dinner this Friday around 8:30 PM. I'll make chicken biryani, feel free to bring snacks or drinks!",
        postedBy: aisha._id,
        category: "event",
        isPinned: false,
        reactions: [
          { user: rafiq._id, emoji: "🔥" },
          { user: farhan._id, emoji: "🍕" },
          { user: zara._id, emoji: "❤️" }
        ],
        rsvps: [
          { user: rafiq._id, status: "going" },
          { user: farhan._id, status: "going" },
          { user: zara._id, status: "going" },
          { user: tanvir._id, status: "maybe" }
        ]
      },
      {
        house: mainHouse._id,
        title: "Reminder: Ensure Main Balcony Door is Latched at Night",
        body: "Due to heavy monsoon wind and rain, please make sure all sliding balcony doors are firmly latched before going to sleep.",
        postedBy: zara._id,
        category: "warning",
        isPinned: false
      }
    ]);

    // -------------------------------------------------------------
    // 11. SEED ANONYMOUS CONFLICT RESOLUTION / COMPLAINTS (Feature 10)
    // -------------------------------------------------------------
    console.log("🛡️ Seeding conflict feedback tickets...");

    await Complaint.create([
      {
        house: mainHouse._id,
        filedBy: null, // Anonymous
        isAnonymous: true,
        against: farhan._id,
        title: "Loud voice chat and gaming sounds past 1:00 AM",
        description: "Noise from bedroom 2 is audible through the corridor during weekday late hours, disturbing sleep.",
        category: "noise",
        status: "under_mediation",
        mediationDeadline: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000),
        mediationVotes: [
          { voter: rafiq._id, verdict: "valid", comment: "Heard it on Tuesday night around 1:30 AM." },
          { voter: zara._id, verdict: "valid", comment: "Please use lower mic volume or headset." }
        ]
      },
      {
        house: mainHouse._id,
        filedBy: aisha._id,
        isAnonymous: false,
        against: farhan._id,
        title: "Unwashed dishes left in sink over 48 hours",
        description: "Frying pan and multiple coffee mugs left in sink attracting fruit flies.",
        category: "cleanliness",
        status: "resolved",
        resolution: "Farhan cleaned up and agreed to wash within 24 hours.",
        resolvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        isRepeatOffense: true
      },
      {
        house: mainHouse._id,
        filedBy: null,
        isAnonymous: true,
        against: tanvir._id,
        title: "Common bathroom exhaust fan left running all day",
        description: "Exhaust fan was left powered on continuously from morning till evening on Sunday.",
        category: "other",
        status: "open"
      }
    ]);

    // -------------------------------------------------------------
    // 12. SEED DIRECT MESSAGES & CHAT (Feature 4)
    // -------------------------------------------------------------
    console.log("💬 Seeding direct chat messages...");

    await Message.create([
      { sender: kamil._id, receiver: rafiq._id, content: "Hi Rafiq! Saw your Mirpur Nest listing. Is the private room with balcony still available?", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), isRead: true },
      { sender: rafiq._id, receiver: kamil._id, content: "Hey Kamil! Yes, it's open. What is your expected move-in date?", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 15 * 60 * 1000), isRead: true },
      { sender: kamil._id, receiver: rafiq._id, content: "Looking to move by the 1st of next month. Can I drop by this weekend to see the place?", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), isRead: false },
      
      { sender: aisha._id, receiver: rafiq._id, content: "Hey Rafiq, did you check the Dot internet receipt I uploaded?", createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), isRead: true },
      { sender: rafiq._id, receiver: aisha._id, content: "Yes! Added to the shared expenses ledger already. Thanks!", createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), isRead: true }
    ]);

    // -------------------------------------------------------------
    // 13. SEED REAL-TIME ACTIVITY LOG (Feature 15)
    // -------------------------------------------------------------
    console.log("⚡ Seeding comprehensive audit activity feed...");

    const activities = [
      { house: mainHouse._id, user: rafiq._id, actionType: "expense_added", title: "Expense Added", description: "Rafiq logged ৳36,000 for August Monthly Apartment Rent", createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000) },
      { house: mainHouse._id, user: aisha._id, actionType: "expense_added", title: "Expense Added", description: "Aisha logged ৳2,500 for Dot Internet 60 Mbps", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) },
      { house: mainHouse._id, user: zara._id, actionType: "chore_done", title: "Chore Completed", description: "Zara completed Common Bathroom Deep Scrub on time", createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000) },
      { house: mainHouse._id, user: farhan._id, actionType: "expense_added", title: "Expense Added", description: "Farhan logged ৳4,850 for Shwapno Weekly Groceries", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000) },
      { house: mainHouse._id, user: rafiq._id, actionType: "maintenance_reported", title: "Maintenance Reported", description: "Rafiq reported Kitchen Sink Pipe Joint Leakage", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000) },
      { house: mainHouse._id, user: rafiq._id, actionType: "maintenance_resolved", title: "Maintenance Resolved", description: "Kitchen Sink Pipe Joint Leakage fixed and split equally (৳1,800)", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { house: mainHouse._id, user: aisha._id, actionType: "rule_proposed", title: "Rule Proposed", description: "Aisha proposed: Weekend overnight guests must be notified 24h in advance", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) },
      { house: mainHouse._id, user: rafiq._id, actionType: "notice_posted", title: "Notice Posted", description: "Rafiq posted: Overhead Water Tank Cleaning This Saturday", createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000) },
      { house: mainHouse._id, user: aisha._id, actionType: "chore_done", title: "Chore Completed", description: "Aisha completed Water Balcony Plants", createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) },
      { house: mainHouse._id, user: farhan._id, actionType: "chore_disputed", title: "Chore Disputed", description: "Farhan disputed Clean Sink & Organize Drying Rack", createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) }
    ];

    await Activity.insertMany(activities);

    console.log("=================================================");
    console.log("🎉 DATABASE SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=================================================");
    console.log("Demo Accounts (Password: 'password123' for all):");
    console.log("  1. rafiq@test.com  (Mirpur Nest - House Admin)");
    console.log("  2. aisha@test.com  (Mirpur Nest - Resident)");
    console.log("  3. farhan@test.com (Mirpur Nest - Resident)");
    console.log("  4. zara@test.com   (Mirpur Nest - Resident)");
    console.log("  5. tanvir@test.com (Mirpur Nest - Resident)");
    console.log("  6. kamil@test.com  (Free Agent - Match Candidate)");
    console.log("=================================================");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
}

seed();
