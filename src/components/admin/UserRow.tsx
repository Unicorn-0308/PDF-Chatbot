import React from 'react'
import { Button } from '@/components/ui/button'
import { User, Shield as ShieldIcon, UserCheck, Eye, Mail as MailIcon, Calendar, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface UserRowProps {
  user: {
    _id: string
    email: string
    name: string
    role: 'user' | 'admin'
    createdAt: Date
  }
  onUpdateRole: (userId: string, newRole: 'user' | 'admin') => void
  isUpdating?: boolean
  canDemoteAdmin?: boolean
  isEven?: boolean
  className?: string
}

export function UserRow({
  user,
  onUpdateRole,
  isUpdating = false,
  canDemoteAdmin = true,
  isEven = false,
  className
}: UserRowProps) {
  return (
    <tr className={cn(
      'border-t hover:bg-muted/30 transition-colors',
      isEven ? 'bg-muted/10' : '',
      className
    )}>
      <td className="p-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-medium text-primary">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">
              ID: {user._id}
            </p>
          </div>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          <MailIcon className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">{user.email}</span>
        </div>
      </td>
      <td className="p-4">
        <span className={cn(
          'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
          user.role === 'admin' 
            ? 'bg-primary/10 text-primary' 
            : 'bg-secondary text-secondary-foreground'
        )}>
          {user.role === 'admin' ? (
            <>
              <ShieldIcon className="h-3 w-3 mr-1" />
              Admin
            </>
          ) : (
            <>
              <User className="h-3 w-3 mr-1" />
              User
            </>
          )}
        </span>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{user.createdAt.toLocaleDateString()}</span>
        </div>
      </td>
      <td className="p-4">
        <div className="flex items-center space-x-2">
          {user.role === 'user' ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateRole(user._id, 'admin')}
              disabled={isUpdating}
              className="flex items-center space-x-1"
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <ShieldIcon className="h-3 w-3" />
                  <span>Make Admin</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onUpdateRole(user._id, 'user')}
              disabled={isUpdating || !canDemoteAdmin}
              className="flex items-center space-x-1"
            >
              {isUpdating ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <>
                  <UserCheck className="h-3 w-3" />
                  <span>Make User</span>
                </>
              )}
            </Button>
          )}
          <Button
            size="sm"
            variant="ghost"
            className="text-muted-foreground"
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </td>
    </tr>
  )
}
