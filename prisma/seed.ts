import { PrismaClient } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Clear existing data
  await prisma.opportunityProduct.deleteMany()
  await prisma.task.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.case.deleteMany()
  await prisma.opportunity.deleteMany()
  await prisma.contact.deleteMany()
  await prisma.account.deleteMany()
  await prisma.product.deleteMany()

  console.log('✓ Cleared existing data')

  // Create Accounts
  const account1 = await prisma.account.create({
    data: {
      name: 'Acme Corporation',
      industry: 'Technology',
      companySize: '1000-5000',
      owner: 'John Doe',
      healthStatus: 'Excellent',
      arr: 500000,
      website: 'https://acme.com',
      phone: '+1-555-0100',
      address: '123 Tech Street, San Francisco, CA 94105',
    },
  })

  const account2 = await prisma.account.create({
    data: {
      name: 'Global Industries',
      industry: 'Manufacturing',
      companySize: '5000+',
      owner: 'Jane Smith',
      healthStatus: 'Good',
      arr: 750000,
      website: 'https://globalindustries.com',
      phone: '+1-555-0200',
      address: '456 Industrial Blvd, Chicago, IL 60601',
    },
  })

  const account3 = await prisma.account.create({
    data: {
      name: 'TechStart Inc',
      industry: 'Software',
      companySize: '50-200',
      owner: 'Mike Johnson',
      healthStatus: 'At Risk',
      arr: 120000,
      website: 'https://techstart.io',
      phone: '+1-555-0300',
      address: '789 Startup Ave, Austin, TX 78701',
    },
  })

  console.log('✓ Created accounts')

  // Create Contacts
  await prisma.contact.createMany({
    data: [
      {
        accountId: account1.id,
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@acme.com',
        phone: '+1-555-0101',
        title: 'VP of Engineering',
        role: 'Decision Maker',
        communicationPreference: 'email',
      },
      {
        accountId: account1.id,
        firstName: 'David',
        lastName: 'Chen',
        email: 'david.chen@acme.com',
        phone: '+1-555-0102',
        title: 'CTO',
        role: 'Champion',
        communicationPreference: 'phone',
      },
      {
        accountId: account2.id,
        firstName: 'Emily',
        lastName: 'Rodriguez',
        email: 'emily.rodriguez@global.com',
        phone: '+1-555-0201',
        title: 'Director of Operations',
        role: 'Influencer',
        communicationPreference: 'email',
      },
      {
        accountId: account3.id,
        firstName: 'Alex',
        lastName: 'Kumar',
        email: 'alex.kumar@techstart.io',
        phone: '+1-555-0301',
        title: 'CEO',
        role: 'Decision Maker',
        communicationPreference: 'text',
      },
    ],
  })

  console.log('✓ Created contacts')

  // Create Opportunities
  await prisma.opportunity.createMany({
    data: [
      {
        accountId: account1.id,
        name: 'Enterprise Platform Upgrade',
        stage: 'Proposal',
        value: 250000,
        probability: 75,
        closeDate: new Date('2024-12-15'),
        nextSteps: 'Send proposal and schedule demo',
        owner: 'John Doe',
      },
      {
        accountId: account2.id,
        name: 'Manufacturing Suite Implementation',
        stage: 'Negotiation',
        value: 500000,
        probability: 90,
        closeDate: new Date('2024-11-30'),
        nextSteps: 'Finalize contract terms',
        owner: 'Jane Smith',
      },
      {
        accountId: account3.id,
        name: 'Starter Package',
        stage: 'Prospecting',
        value: 50000,
        probability: 20,
        closeDate: new Date('2025-02-28'),
        nextSteps: 'Initial discovery call',
        owner: 'Mike Johnson',
      },
    ],
  })

  console.log('✓ Created opportunities')

  // Create Products
  const product1 = await prisma.product.create({
    data: {
      name: 'Enterprise Platform',
      sku: 'ENT-001',
      description: 'Full-featured enterprise platform with all modules',
      price: 50000,
      status: 'Active',
      category: 'Software',
    },
  })

  const product2 = await prisma.product.create({
    data: {
      name: 'Professional Suite',
      sku: 'PRO-001',
      description: 'Professional tier with advanced features',
      price: 25000,
      status: 'Active',
      category: 'Software',
    },
  })

  await prisma.product.create({
    data: {
      name: 'Starter Package',
      sku: 'START-001',
      description: 'Basic package for small teams',
      price: 10000,
      status: 'Active',
      category: 'Software',
    },
  })

  console.log('✓ Created products')

  // Create Activities
  await prisma.activity.createMany({
    data: [
      {
        accountId: account1.id,
        type: 'Call',
        subject: 'Discovery Call',
        description: 'Discussed platform requirements and timeline',
        owner: 'John Doe',
        activityDate: new Date('2024-10-20'),
      },
      {
        accountId: account2.id,
        type: 'Meeting',
        subject: 'Quarterly Business Review',
        description: 'Reviewed Q3 performance and Q4 goals',
        owner: 'Jane Smith',
        activityDate: new Date('2024-10-18'),
      },
      {
        accountId: account1.id,
        type: 'Email',
        subject: 'Follow-up on Demo',
        description: 'Sent additional resources and documentation',
        owner: 'John Doe',
        activityDate: new Date('2024-10-22'),
      },
    ],
  })

  console.log('✓ Created activities')

  // Create Tasks
  await prisma.task.createMany({
    data: [
      {
        accountId: account1.id,
        title: 'Prepare proposal for Acme',
        description: 'Create detailed proposal for Enterprise Platform Upgrade',
        status: 'In Progress',
        priority: 'High',
        dueDate: new Date('2024-10-30'),
        owner: 'John Doe',
        completed: false,
      },
      {
        accountId: account2.id,
        title: 'Schedule contract review',
        description: 'Arrange meeting with legal team',
        status: 'Pending',
        priority: 'Medium',
        dueDate: new Date('2024-10-28'),
        owner: 'Jane Smith',
        completed: false,
      },
    ],
  })

  console.log('✓ Created tasks')

  // Create Cases
  await prisma.case.createMany({
    data: [
      {
        accountId: account1.id,
        subject: 'Login Issue',
        description: 'User unable to access platform after password reset',
        status: 'In Progress',
        priority: 'High',
        category: 'Technical',
        owner: 'Support Team',
      },
      {
        accountId: account2.id,
        subject: 'Feature Request',
        description: 'Request for custom reporting dashboard',
        status: 'New',
        priority: 'Low',
        category: 'Enhancement',
        owner: 'Product Team',
      },
    ],
  })

  console.log('✓ Created cases')

  console.log('✅ Seeding completed successfully!')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
