'use client'

import { useState } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Slider,
  Switch,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'

export default function DemoPage() {
  const [switchValue, setSwitchValue] = useState(false)
  const [sliderValue, setSliderValue] = useState([50])

  return (
    <TooltipProvider>
      <div className="min-h-screen bg-bg p-8">
        <div className="mx-auto max-w-4xl space-y-12">
          <header>
            <h1 className="font-serif text-4xl">Component Demo</h1>
            <p className="mt-2 text-text-muted">Testing shadcn/ui components with custom theme</p>
          </header>

          {/* Buttons */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl">Buttons</h2>
            <div className="flex flex-wrap gap-4">
              <Button>Default Button</Button>
              <Button variant="outline">Outline Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
              <Button size="sm">Small</Button>
              <Button size="lg">Large</Button>
            </div>
          </section>

          {/* Cards */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl">Cards</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>At Home</CardTitle>
                  <CardDescription>Kitchen, Bedroom, Bath...</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-muted">6 Scenarios available</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Stores</CardTitle>
                  <CardDescription>Grocery, Clothing, Tech...</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-text-muted">10 Scenarios available</p>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Tooltip */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl">Tooltip</h2>
            <div className="flex gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="cursor-pointer rounded bg-accent px-2 py-1">
                    rummage through
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>To search for something by moving things around carelessly</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </section>

          {/* Switch */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl">Switch (Translation Toggle)</h2>
            <div className="flex items-center gap-4">
              <Switch checked={switchValue} onCheckedChange={setSwitchValue} />
              <span className="text-sm">
                Show Chinese translations: {switchValue ? 'On' : 'Off'}
              </span>
            </div>
          </section>

          {/* Slider */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl">Slider (Font Size)</h2>
            <div className="max-w-sm space-y-2">
              <Slider value={sliderValue} onValueChange={setSliderValue} max={100} step={1} />
              <p className="text-sm text-text-muted">Value: {sliderValue[0]}</p>
            </div>
          </section>

          {/* Accordion */}
          <section className="space-y-4">
            <h2 className="font-serif text-2xl">Accordion (Vocabulary Panel)</h2>
            <Accordion type="single" collapsible className="w-full max-w-md">
              <AccordionItem value="item-1">
                <AccordionTrigger>rummage through</AccordionTrigger>
                <AccordionContent>
                  <p>To search for something by moving things around carelessly.</p>
                  <p className="mt-1 text-text-muted">翻找 / 翻箱倒柜</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>dash over</AccordionTrigger>
                <AccordionContent>
                  <p>To run or move somewhere very quickly.</p>
                  <p className="mt-1 text-text-muted">冲过去</p>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>snatch up</AccordionTrigger>
                <AccordionContent>
                  <p>To take something quickly and roughly.</p>
                  <p className="mt-1 text-text-muted">一把抓起</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>
    </TooltipProvider>
  )
}
