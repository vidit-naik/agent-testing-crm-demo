'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import { HelpCircle, Book, Video } from 'lucide-react'

export default function HelpPage() {
  const faqs = [
    {
      question: 'How do I reset the demo data?',
      answer: 'Go to Settings and click the "Reset Data" button. You can also manually run the seed.sql script in your Supabase SQL Editor to restore the original demo data.',
    },
    {
      question: 'Can I create new records?',
      answer: 'Yes! Click the "New" or "Create" buttons throughout the application to add accounts, contacts, opportunities, tasks, cases, and products. Your data will be saved to your Supabase database.',
    },
    {
      question: 'How do I connect to my Supabase instance?',
      answer: 'Create a .env.local file in the root directory and add your Supabase URL and anon key. See the README and supabase/README.md for detailed instructions.',
    },
    {
      question: 'What are personas?',
      answer: 'Personas allow you to view the CRM from different role perspectives (Sales, Marketing, Support). You can change your persona in the Settings page.',
    },
    {
      question: 'How do I filter and search records?',
      answer: 'Use the search bars and filter dropdowns available on each list page. You can search by name, email, company, and other relevant fields.',
    },
    {
      question: 'Can I customize the CRM?',
      answer: 'This is a demo application built with Next.js and Supabase. You can modify the code to add custom fields, new modules, or change the UI to fit your needs.',
    },
  ]

  const tours = [
    {
      title: 'Dashboard Overview',
      description: 'Learn about the dashboard stats, recent activities, and quick actions',
      duration: '5 min',
    },
    {
      title: 'Account Management Deep Dive',
      description: 'Explore account details, contacts, opportunities, and activity timeline',
      duration: '8 min',
    },
    {
      title: 'Opportunity Pipeline',
      description: 'Understand the Kanban view, stage transitions, and deal management',
      duration: '6 min',
    },
    {
      title: 'Support Case Management',
      description: 'Track cases, assign priorities, and manage customer support requests',
      duration: '7 min',
    },
  ]

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground">Get help with using the Demo CRM</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            <CardTitle>Guided Tours</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tours.map((tour, index) => (
              <div
                key={index}
                className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex-1">
                  <h3 className="font-medium">{tour.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{tour.description}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">{tour.duration}</span>
                  <Video className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-primary" />
            <CardTitle>Frequently Asked Questions</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="pb-4 border-b last:border-0">
                <h3 className="font-medium mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground">{faq.answer}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}
