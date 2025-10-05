import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Mail, Shield, Sparkles, Users } from 'lucide-react';
import { login } from '@/features/auth/api';
import { useAuth } from '@/features/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { queryClient } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { email: '', password: '' } });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      await queryClient.invalidateQueries({ queryKey: ['me'] });
      
      // Safari-specific navigation fix: use setTimeout to ensure state updates
      setTimeout(() => {
        navigate('/employees');
      }, 100);
    } catch (err: any) {
      const message = err?.message || 'Login failed';
      toast({ title: 'Login failed', description: message, variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-bg">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="inline-flex items-center justify-center w-16 h-16 mb-4 rounded-2xl bg-gradient-primary shadow-custom-lg"
            >
              <Shield className="w-8 h-8 text-primary-foreground" />
            </motion.div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent mb-2">
              EPI USE
            </h1>
            <p className="text-lg text-muted-foreground font-medium">
              Employee Management System
            </p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Secure Admin Access</span>
              <Sparkles className="w-4 h-4 text-primary" />
            </div>
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="card-premium border-primary/20 backdrop-blur-sm">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-semibold text-card-foreground">
                  Welcome Back
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Sign in to access your admin dashboard
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-card-foreground flex items-center gap-2">
                            <Mail className="w-4 h-4" />
                            Email Address
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="email" 
                                placeholder="admin@epiuse.local" 
                                className="input-solid pl-10" 
                                {...field} 
                              />
                              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-sm font-medium text-card-foreground flex items-center gap-2">
                            <Lock className="w-4 h-4" />
                            Password
                          </FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                className="input-solid pl-10" 
                                {...field} 
                              />
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button 
                        type="submit" 
                        className="w-full btn-primary-polished h-12 text-base font-semibold" 
                        disabled={submitting}
                      >
                        {submitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full mr-2"
                          />
                        ) : (
                          <Users className="w-5 h-5 mr-2" />
                        )}
                        {submitting ? 'Signing in...' : 'Sign In to Dashboard'}
                      </Button>
                    </motion.div>
                  </form>
                </Form>
                
                {/* Additional Info */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                  className="text-center pt-4 border-t border-border/50"
                >
                  <p className="text-xs text-muted-foreground">
                    🔒 Your session is encrypted and secure
                  </p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="text-center mt-8"
          >
            <p className="text-sm text-muted-foreground">
              Powered by <span className="text-primary font-medium">EPI USE Technology</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}


