import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing data
  await prisma.task.deleteMany()
  await prisma.project.deleteMany()

  // Create sample projects
  const project1 = await prisma.project.create({
    data: {
      name: 'Website Redesign',
      completed: false,
      tasks: {
        create: [
          { title: 'Design mockups', completed: true },
          { title: 'Implement header component', completed: true },
          { title: 'Add responsive navigation', completed: false },
        ]
      }
    }
  })

  const project2 = await prisma.project.create({
    data: {
      name: 'Mobile App Development',
      completed: false,
      tasks: {
        create: [
          { title: 'Set up React Native project', completed: true },
          { title: 'Create login screen', completed: false },
          { title: 'Implement user authentication', completed: false },
        ]
      }
    }
  })

  const project3 = await prisma.project.create({
    data: {
      name: 'Documentation Update',
      completed: true,
      tasks: {
        create: [
          { title: 'Update API documentation', completed: true },
          { title: 'Review user guides', completed: true },
        ]
      }
    }
  })

  const project4 = await prisma.project.create({
    data: {
      name: 'Database Migration',
      completed: false,
      tasks: {
        create: [
          { title: 'Plan migration strategy', completed: true },
          { title: 'Test migration scripts', completed: false },
        ]
      }
    }
  })

  console.log('Database seeded successfully!')
  console.log(`Created ${4} projects and ${8} tasks`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })