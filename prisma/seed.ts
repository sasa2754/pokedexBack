import { prisma } from "../src/lib/prisma.ts";

async function seed() {
  // Adding pokébolas on database
  const pokebolas = [
    { name: "Pokeball", capture_percentual: 0.4, image: "../images/pokeballs/pokeball.png" },
    { name: "Greatball", capture_percentual: 0.6, image: "../images/pokeballs/greatball.png" },
    { name: "Ultraball", capture_percentual: 0.8, image: "../images/pokeballs/ultraball.png" },
    { name: "Masterball", capture_percentual: 1.0, image: "../images/pokeballs/masterball.png" }, 
  ];

  // Inserting ...
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
    process.exit(1); // Exit code error
  })
  .finally(async () => {
    await prisma.$disconnect(); // thats is disconnecting database if sucess on the task
  });



  
// npx prisma migrate dev
// npx prisma db seed