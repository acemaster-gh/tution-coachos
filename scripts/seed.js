// Seeds data/users.json with demo accounts for each role.
// Run: node scripts/seed.js
const fs = require("node:fs");
const path = require("node:path");
const bcrypt = require("bcryptjs");

const DEMO_PASSWORD = "demo1234";

async function main() {
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const users = [
    {
      id: "u_admin",
      name: "Rajesh Kumar",
      email: "admin@ascentlearning.example",
      passwordHash,
      role: "admin",
    },
    {
      id: "u_tutor",
      name: "Meena Iyer",
      email: "tutor@ascentlearning.example",
      passwordHash,
      role: "tutor",
    },
    {
      id: "u_parent",
      name: "Priya Sharma",
      email: "parent@ascentlearning.example",
      passwordHash,
      role: "parent",
      studentName: "Aarav Sharma",
    },
    {
      id: "u_parent_diya",
      name: "Anil Patel",
      email: "parent.diya@ascentlearning.example",
      passwordHash,
      role: "parent",
      studentName: "Diya Patel",
    },
    {
      id: "u_parent_kabir",
      name: "Sunita Singh",
      email: "parent.kabir@ascentlearning.example",
      passwordHash,
      role: "parent",
      studentName: "Kabir Singh",
    },
    {
      id: "u_parent_ishaan",
      name: "Rohan Verma",
      email: "parent.ishaan@ascentlearning.example",
      passwordHash,
      role: "parent",
      studentName: "Ishaan Verma",
    },
    {
      id: "u_parent_sana",
      name: "Farah Khan",
      email: "parent.sana@ascentlearning.example",
      passwordHash,
      role: "parent",
      studentName: "Sana Khan",
    },
  ];

  const outPath = path.join(__dirname, "..", "data", "users.json");
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(users, null, 2));
  console.log(`Seeded ${users.length} demo users -> ${outPath}`);
  console.log(`All demo accounts use password: ${DEMO_PASSWORD}`);
}

main();
