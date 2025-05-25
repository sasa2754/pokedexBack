import { prisma } from "../src/lib/prisma.ts";

async function seed() {
  // Adding pokébolas on database
  console.log(process.env.DATABASE_URL)
  const pokebolas = [
    { name: "Pokeball", capture_percentual: 4, image: "../images/pokeballs/pokeball.png", price: 2 },
    { name: "Greatball", capture_percentual: 6, image: "../images/pokeballs/greatball.png", price: 5 },
    { name: "Ultraball", capture_percentual: 8, image: "../images/pokeballs/ultraball.png", price: 20 },
    { name: "Masterball", capture_percentual: 10, image: "../images/pokeballs/masterball.png", price: 1000 }, 
  ];

  for (const ball of pokebolas) {
    await prisma.pokeball.create({
      data: ball,
    });
  }

  console.log("Pokébolas criadas com sucesso!");
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });



  
// npx prisma migrate dev
// npx prisma db seed