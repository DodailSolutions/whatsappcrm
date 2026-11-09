"use client"

import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

type TabsVariant = "default" | "line" | "pills"
type TabsSize = "sm" | "default" | "lg"

interface TabsContextValue {
  variant: TabsVariant
  size: TabsSize
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: "default",
  size: "default",
})

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-3 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "group/tabs-list relative inline-flex items-center text-muted-foreground transition-all max-w-full overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden group-data-vertical/tabs:flex-col group-data-vertical/tabs:h-fit group-data-vertical/tabs:w-full",
  {
    variants: {
      variant: {
        default:
          "w-fit rounded-xl bg-muted/80 p-1 border border-border/50 gap-1 shadow-2xs backdrop-blur-xs",
        line:
          "w-full justify-start rounded-none bg-transparent border-b border-border/80 p-0 gap-2 sm:gap-6",
        pills:
          "w-fit rounded-xl bg-transparent p-0 gap-1.5",
      },
      size: {
        sm: "min-h-8 text-xs",
        default: "min-h-9 sm:min-h-10 text-xs sm:text-sm",
        lg: "min-h-11 sm:min-h-12 text-sm sm:text-base",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TabsListProps
  extends TabsPrimitive.List.Props,
    VariantProps<typeof tabsListVariants> {}

function TabsList({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: TabsListProps) {
  const safeVariant = variant ?? "default"
  const safeSize = size ?? "default"

  return (
    <TabsContext.Provider value={{ variant: safeVariant, size: safeSize }}>
      <TabsPrimitive.List
        data-slot="tabs-list"
        data-variant={safeVariant}
        data-size={safeSize}
        className={cn(tabsListVariants({ variant: safeVariant, size: safeSize }), className)}
        {...props}
      >
        {children}
      </TabsPrimitive.List>
    </TabsContext.Provider>
  )
}

const tabsTriggerVariants = cva(
  "group/tabs-trigger relative inline-flex items-center justify-center whitespace-nowrap font-medium transition-all shrink-0 cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "rounded-lg text-muted-foreground hover:text-foreground data-active:bg-background data-active:text-foreground data-active:font-semibold data-active:shadow-xs dark:data-active:bg-card dark:data-active:text-foreground active:scale-[0.98]",
        line:
          "rounded-none border-b-2 border-transparent text-muted-foreground hover:text-foreground hover:border-border/80 data-active:border-primary data-active:text-primary data-active:font-semibold -mb-px pb-2.5 pt-2",
        pills:
          "rounded-lg text-muted-foreground hover:bg-muted/80 hover:text-foreground data-active:bg-primary/10 data-active:text-primary data-active:font-semibold active:scale-[0.98]",
      },
      size: {
        sm: "px-2.5 py-1 text-xs gap-1.5 h-7",
        default: "px-3.5 py-1.5 text-xs sm:text-sm gap-2 h-8 sm:h-9",
        lg: "px-4.5 py-2 text-sm sm:text-base gap-2.5 h-10 sm:h-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface TabsTriggerProps
  extends TabsPrimitive.Tab.Props,
    VariantProps<typeof tabsTriggerVariants> {}

function TabsTrigger({
  className,
  variant,
  size,
  ...props
}: TabsTriggerProps) {
  const context = React.useContext(TabsContext)
  const resolvedVariant = variant ?? context.variant ?? "default"
  const resolvedSize = size ?? context.size ?? "default"

  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        tabsTriggerVariants({ variant: resolvedVariant, size: resolvedSize }),
        className
      )}
      {...props}
    />
  )
}

function TabsIndicator({
  className,
  variant,
  ...props
}: TabsPrimitive.Indicator.Props & { variant?: TabsVariant }) {
  const context = React.useContext(TabsContext)
  const resolvedVariant = variant ?? context.variant ?? "default"

  return (
    <TabsPrimitive.Indicator
      data-slot="tabs-indicator"
      className={cn(
        "absolute transition-all duration-200 ease-out z-0 pointer-events-none",
        resolvedVariant === "line" &&
          "bottom-0 left-[var(--active-tab-left)] w-[var(--active-tab-width)] h-0.5 bg-primary",
        resolvedVariant === "default" &&
          "top-[var(--active-tab-top)] left-[var(--active-tab-left)] w-[var(--active-tab-width)] h-[var(--active-tab-height)] bg-background dark:bg-card rounded-lg shadow-xs",
        resolvedVariant === "pills" &&
          "top-[var(--active-tab-top)] left-[var(--active-tab-left)] w-[var(--active-tab-width)] h-[var(--active-tab-height)] bg-primary/10 rounded-lg",
        className
      )}
      {...props}
    />
  )
}

function TabsBadge({
  children,
  className,
  active,
}: {
  children: React.ReactNode
  className?: string
  active?: boolean
}) {
  return (
    <span
      className={cn(
        "ml-1 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums tracking-tight transition-colors",
        active
          ? "bg-primary/20 text-primary"
          : "bg-muted text-muted-foreground group-data-active/tabs-trigger:bg-primary/15 group-data-active/tabs-trigger:text-primary",
        className
      )}
    >
      {children}
    </span>
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn(
        "flex-1 text-sm outline-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 animate-in fade-in-50 duration-150",
        className
      )}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  TabsIndicator,
  TabsBadge,
  tabsListVariants,
  tabsTriggerVariants,
}
