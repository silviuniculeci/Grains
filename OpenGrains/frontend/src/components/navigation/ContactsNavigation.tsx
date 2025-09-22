import React, { useState } from 'react'
import ContactList from '@/pages/contacts/ContactList'
import ContactForm from '@/pages/contacts/ContactForm'

interface ContactsNavigationState {
  view: 'list' | 'form' | 'view'
  contactId?: string
}

const ContactsNavigation: React.FC = () => {
  const [navigationState, setNavigationState] = useState<ContactsNavigationState>({
    view: 'list'
  })

  // Navigation functions that can be passed to child components
  const navigate = {
    toList: () => setNavigationState({ view: 'list' }),
    toNew: () => setNavigationState({ view: 'form' }),
    toEdit: (id: string) => setNavigationState({ view: 'form', contactId: id }),
    toView: (id: string) => setNavigationState({ view: 'view', contactId: id })
  }

  // Render the appropriate component based on current view
  const renderCurrentView = () => {
    switch (navigationState.view) {
      case 'list':
        return <ContactList navigate={navigate} />

      case 'form':
        return (
          <ContactForm
            contactId={navigationState.contactId}
            navigate={navigate}
          />
        )

      case 'view':
        return (
          <ContactForm
            contactId={navigationState.contactId}
            navigate={navigate}
            readOnly={true}
          />
        )

      default:
        return <ContactList navigate={navigate} />
    }
  }

  return (
    <div className="w-full">
      {renderCurrentView()}
    </div>
  )
}

export default ContactsNavigation