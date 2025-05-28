import { Package, MapPin, User } from "lucide-react";

interface AccountTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function AccountTabs({ activeTab, onTabChange }: AccountTabsProps) {
  const tabs = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
    },
    {
      id: "orders",
      label: "Orders",
      icon: Package,
    },
    {
      id: "addresses",
      label: "Addresses",
      icon: MapPin,
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }
              `}
            >
              <Icon
                className={`
                  -ml-0.5 mr-2 h-5 w-5
                  ${
                    activeTab === tab.id
                      ? "text-indigo-500"
                      : "text-gray-400 group-hover:text-gray-500"
                  }
                `}
                aria-hidden="true"
              />
              {tab.label}
            </button>
          );
        })}
      </nav>
    </div>
  );
} 