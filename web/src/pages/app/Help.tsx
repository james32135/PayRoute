import { motion } from 'framer-motion';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FAQS } from '@/lib/constants';
import { HelpCircle, MessageCircle, Book, ExternalLink } from 'lucide-react';

export default function Help() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto space-y-8"
    >
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
          <HelpCircle className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-display font-bold">Help Center</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Find answers to common questions about PayRoute
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6 glass-card hover:glow-primary transition-all duration-300 cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <Book className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-bold mb-2">Documentation</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete guides and API references
          </p>
          <Button variant="outline" size="sm" className="w-full gap-2">
            View Docs
            <ExternalLink className="w-3 h-3" />
          </Button>
        </Card>

        <Card className="p-6 glass-card hover:glow-primary transition-all duration-300 cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
            <MessageCircle className="w-5 h-5 text-secondary" />
          </div>
          <h3 className="font-display font-bold mb-2">Community</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Join our Discord for live support
          </p>
          <Button variant="outline" size="sm" className="w-full gap-2">
            Join Discord
            <ExternalLink className="w-3 h-3" />
          </Button>
        </Card>

        <Card className="p-6 glass-card hover:glow-primary transition-all duration-300 cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
            <HelpCircle className="w-5 h-5 text-primary" />
          </div>
          <h3 className="font-display font-bold mb-2">Contact Support</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Get help from our support team
          </p>
          <Button variant="outline" size="sm" className="w-full gap-2">
            Email Us
            <ExternalLink className="w-3 h-3" />
          </Button>
        </Card>
      </div>

      {/* FAQ Section */}
      <Card className="p-6 glass-card">
        <h2 className="text-2xl font-display font-bold mb-6">Frequently Asked Questions</h2>
        
        <Accordion type="single" collapsible className="w-full">
          {FAQS.map((faq, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionTrigger className="text-left font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Card>

      {/* Additional Resources */}
      <Card className="p-6 glass-card">
        <h2 className="text-xl font-display font-bold mb-4">Additional Resources</h2>
        <div className="space-y-3">
          {[
            'Getting Started Guide',
            'Video Tutorials',
            'Security Best Practices',
            'Understanding ZK Credentials',
            'AI Routing Explained',
            'Vault Strategy Details',
          ].map((resource, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/30 transition-colors cursor-pointer group"
            >
              <span className="text-sm">{resource}</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          ))}
        </div>
      </Card>

      {/* Still Need Help */}
      <Card className="p-8 glass-card bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/20">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-display font-bold">Still need help?</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Our support team is here to help you with any questions or issues you might have.
          </p>
          <Button size="lg" className="gap-2">
            Contact Support
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}
