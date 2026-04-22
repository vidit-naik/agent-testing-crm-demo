"use client";

import { useApp } from "@/contexts/AppContext";
import { CreateContactModal } from "./CreateContactModal";
import { CreateAccountModal } from "./CreateAccountModal";
import { CreateOpportunityModal } from "./CreateOpportunityModal";
import { OpportunityWizard } from "./OpportunityWizard";
import { CreateTaskModal } from "./CreateTaskModal";
import { CreateActivityModal } from "./CreateActivityModal";
import { CreateCaseModal } from "./CreateCaseModal";
import { CreateProductModal } from "./CreateProductModal";
import { EditContactModal } from "./EditContactModal";
import { EditAccountModal } from "./EditAccountModal";
import { EditOpportunityModal } from "./EditOpportunityModal";
import { EditCaseModal } from "./EditCaseModal";
import { EditTaskModal } from "./EditTaskModal";
import { EditActivityModal } from "./EditActivityModal";
import { EditProductModal } from "./EditProductModal";

export function ModalManager() {
  const { modalState } = useApp();

  if (!modalState.isOpen) return null;

  switch (modalState.type) {
    case "createContact":
      return <CreateContactModal />;
    case "createAccount":
      return <CreateAccountModal />;
    case "createOpportunity":
      return <OpportunityWizard />;
    case "createOpportunityClassic":
      return <CreateOpportunityModal />;
    case "createTask":
      return <CreateTaskModal />;
    case "createActivity":
      return <CreateActivityModal />;
    case "createCase":
      return <CreateCaseModal />;
    case "createProduct":
      return <CreateProductModal />;
    case "editContact":
      return <EditContactModal />;
    case "editAccount":
      return <EditAccountModal />;
    case "editOpportunity":
      return <EditOpportunityModal />;
    case "editCase":
      return <EditCaseModal />;
    case "editTask":
      return <EditTaskModal />;
    case "editActivity":
      return <EditActivityModal />;
    case "editProduct":
      return <EditProductModal />;
    default:
      return null;
  }
}
