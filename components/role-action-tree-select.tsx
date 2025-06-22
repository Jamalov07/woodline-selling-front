"use client"

import { useState, useEffect } from "react"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ChevronDown, ChevronRight } from "lucide-react"
import { apiService, type Role } from "@/lib/api"

interface RoleActionTreeSelectProps {
  selectedRoles: string[]
  selectedActions: string[]
  onRoleChange: (roles: string[]) => void
  onActionChange: (actions: string[]) => void
  defaultSelectedRole?: string
}

export function RoleActionTreeSelect({
  selectedRoles,
  selectedActions,
  onRoleChange,
  onActionChange,
  defaultSelectedRole,
}: RoleActionTreeSelectProps) {
  const [roles, setRoles] = useState<Role[]>([])
  const [expandedRoles, setExpandedRoles] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRoles()
  }, [])

  useEffect(() => {
    if (defaultSelectedRole && !selectedRoles.includes(defaultSelectedRole)) {
      onRoleChange([...selectedRoles, defaultSelectedRole])
    }
  }, [defaultSelectedRole, selectedRoles, onRoleChange])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      const response = await apiService.getRoles({
        pagination: false,
      })

      if (response.success.is) {
        setRoles(response.data.data)
      }
    } catch (error) {
      console.error("Error fetching roles:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleRoleToggle = (roleName: string) => {
    if (defaultSelectedRole === roleName) return // Don't allow unchecking default role

    const newSelectedRoles = selectedRoles.includes(roleName)
      ? selectedRoles.filter((r) => r !== roleName)
      : [...selectedRoles, roleName]

    onRoleChange(newSelectedRoles)
  }

  const handleActionToggle = (actionId: string) => {
    const newSelectedActions = selectedActions.includes(actionId)
      ? selectedActions.filter((a) => a !== actionId)
      : [...selectedActions, actionId]

    onActionChange(newSelectedActions)
  }

  const toggleRoleExpansion = (roleName: string) => {
    setExpandedRoles((prev) => (prev.includes(roleName) ? prev.filter((r) => r !== roleName) : [...prev, roleName]))
  }

  const getMethodBadgeColor = (method: string) => {
    switch (method.toLowerCase()) {
      case "get":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "post":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "put":
      case "patch":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "delete":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  if (loading) {
    return <div className="text-center py-4">Yuklanmoqda...</div>
  }

  return (
    <ScrollArea className="h-[400px] border rounded-md p-4">
      <div className="space-y-2">
        {roles.map((role, roleIndex) => (
          <div key={role.name}>
            <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
              <button
                type="button"
                onClick={() => toggleRoleExpansion(role.name)}
                className="flex items-center justify-center w-4 h-4"
              >
                {expandedRoles.includes(role.name) ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>
              <Checkbox
                id={`role-${role.name}`}
                checked={selectedRoles.includes(role.name)}
                onCheckedChange={() => handleRoleToggle(role.name)}
                disabled={defaultSelectedRole === role.name}
              />
              <label htmlFor={`role-${role.name}`} className="font-medium cursor-pointer flex-1">
                {role.name}
                {defaultSelectedRole === role.name && (
                  <span className="text-xs text-muted-foreground ml-2">(default)</span>
                )}
              </label>
            </div>

            {expandedRoles.includes(role.name) && (
              <div className="ml-6 mt-2 space-y-1">
                {role.actions.map((action, actionIndex) => (
                  <div key={action.id}>
                    <div className="flex items-center space-x-2 p-2 hover:bg-muted rounded-md">
                      <Checkbox
                        id={`action-${action.id}`}
                        checked={selectedActions.includes(action.id)}
                        onCheckedChange={() => handleActionToggle(action.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getMethodBadgeColor(
                              action.method,
                            )}`}
                          >
                            {action.method.toUpperCase()}
                          </span>
                          <span className="font-mono text-sm">{action.url}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">{action.name}</span>
                          {action.description && <span> - {action.description}</span>}
                        </div>
                      </div>
                    </div>
                    {actionIndex < role.actions.length - 1 && <Separator className="ml-6 my-1" />}
                  </div>
                ))}
              </div>
            )}
            {roleIndex < roles.length - 1 && <Separator className="my-2" />}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}
