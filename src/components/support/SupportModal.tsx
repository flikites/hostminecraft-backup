import React, { useState } from 'react';
import { Card, CardContent, CardHeader } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Send, Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SupportModal({ isOpen, onClose }: SupportModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.full_name || '',
    email: user?.email || '',
    subject: '',
    message: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user?.id || null,
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message,
          priority: 'medium',
        });

      if (error) throw error;

      toast.success('Support ticket submitted successfully! We\'ll get back to you soon.');
      setFormData({
        name: user?.full_name || '',
        email: user?.email || '',
        subject: '',
        message: '',
      });
      onClose();
    } catch (error: any) {
      console.error('Error submitting support ticket:', error);
      toast.error('Failed to submit support ticket. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        <Card variant="minecraft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/logo.svg" alt="HostMinecraft Logo" className="w-8 h-8" />
                <h2 className="text-xl font-minecraft font-bold text-minecraft-800">
                  Contact Support
                </h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                icon={X}
                onClick={onClose}
              />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-stone-600 font-minecraft text-sm mb-6">
              Need help? Send us a message and we'll get back to you as soon as possible.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Your Name"
                  value={formData.name}
                  onChange={(value) => setFormData({ ...formData, name: value })}
                  placeholder="Steve Minecraft"
                  required
                />
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  onChange={(value) => setFormData({ ...formData, email: value })}
                  placeholder="steve@minecraft.com"
                  required
                />
              </div>
              
              <Input
                label="Subject"
                value={formData.subject}
                onChange={(value) => setFormData({ ...formData, subject: value })}
                placeholder="What can we help you with?"
                required
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-stone-700 font-minecraft">
                  Message <span className="text-red-500 ml-1">*</span>
                </label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  placeholder="Please describe your issue or question in detail..."
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-stone-300 rounded-md focus:outline-none focus:ring-2 focus:ring-grass-500 focus:border-transparent font-minecraft resize-none"
                />
              </div>

              <div className="flex gap-4">
                <Button 
                  type="submit" 
                  variant="primary" 
                  icon={Send}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Sending...' : 'Send Message'}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={loading}
                >
                  Cancel
                </Button>
              </div>
            </form>

            <div className="mt-6 pt-6 border-t border-stone-200">
              <p className="text-xs text-stone-500 font-minecraft text-center">
                We typically respond within 24 hours. For urgent issues, please include "URGENT" in your subject line.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}