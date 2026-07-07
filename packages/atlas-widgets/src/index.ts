import React from 'react';

export interface WidgetManifest {
  id: string;
  name: string;
  description: string;
  defaultWidth?: number;
  defaultHeight?: number;
  minWidth?: number;
  minHeight?: number;
  component: React.ComponentType<any>;
}

export class WidgetRegistry {
  private widgets: Map<string, WidgetManifest> = new Map();

  register(widget: WidgetManifest) {
    if (this.widgets.has(widget.id)) {
      console.warn(`Widget with id ${widget.id} is already registered.`);
      return;
    }
    this.widgets.set(widget.id, widget);
  }

  get(id: string): WidgetManifest | undefined {
    return this.widgets.get(id);
  }

  getAll(): WidgetManifest[] {
    return Array.from(this.widgets.values());
  }
}

export const widgetRegistry = new WidgetRegistry();
