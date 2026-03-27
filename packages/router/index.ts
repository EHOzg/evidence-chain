export * from './routes'

export function transformSharedRoutes(
  config: any[],
  componentMap: Record<string, any>,
): any[] {
  return config.map((r) => {
    const route = {
      ...r,
      component: r.componentKey ? componentMap[r.componentKey] : undefined,
    }

    if (r.children && r.children.length > 0) {
      route.children = transformSharedRoutes(r.children, componentMap)
    }

    return route
  })
}
