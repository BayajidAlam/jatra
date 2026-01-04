"use client"

import { useState } from "react"
import Link from "next/link"
import { Calendar, MapPin, Users, Clock, CreditCard, Shield, Zap, ArrowRight, Train, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
              <Train className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-900">Jatra Railway</h1>
              <p className="text-xs text-gray-600">Smart Booking System</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Link href="/login">
              <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="bg-orange-500 hover:bg-orange-600 text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-5xl md:text-6xl font-bold leading-tight">
              Book Train Tickets
              <br />
              <span className="text-orange-400">Faster & Smarter</span>
            </h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              Experience hassle-free train booking with real-time seat availability, instant confirmations, and secure payments
            </p>
            <div className="flex gap-4 justify-center pt-4">
              <Link href="/dashboard">
                <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white text-lg px-8 h-14 rounded-xl">
                  <Calendar className="w-5 h-5" />
                  <span>Search Trains</span>
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" variant="outline" className="bg-white/10 text-white border-2 border-white/30 hover:bg-white/20 text-lg px-8 h-14 rounded-xl">
                  Create Account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">Why Choose Jatra?</h3>
            <p className="text-gray-600 text-lg">Everything you need for seamless railway booking</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-orange-500" />
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Instant Booking</h4>
              <p className="text-gray-600">
                Book tickets in under 2 minutes with our streamlined process
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Clock className="w-7 h-7 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Real-Time Updates</h4>
              <p className="text-gray-600">
                Get live seat availability and instant confirmation
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-orange-500" />
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Secure Payments</h4>
              <p className="text-gray-600">
                Multiple payment options with bank-grade security
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-200">
              <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Train className="w-7 h-7 text-blue-600" />
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Digital Tickets</h4>
              <p className="text-gray-600">
                Get QR code tickets instantly on your phone
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">How It Works</h3>
            <p className="text-gray-600 text-lg">Simple steps to your journey</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                1
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Search Trains</h4>
              <p className="text-gray-600">Enter your route, date, and number of passengers to find available trains</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                2
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Select Seats</h4>
              <p className="text-gray-600">Choose your preferred seats from the live seat map with real-time availability</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold">
                3
              </div>
              <h4 className="text-xl font-bold text-blue-900 mb-2">Pay & Travel</h4>
              <p className="text-gray-600">Complete payment securely and receive your digital ticket instantly</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-blue-800 text-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold text-orange-400 mb-2">50K+</div>
              <p className="text-blue-100">Happy Travelers</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-orange-400 mb-2">200+</div>
              <p className="text-blue-100">Daily Trains</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-orange-400 mb-2">98%</div>
              <p className="text-blue-100">Success Rate</p>
            </div>
            <div>
              <div className="text-5xl font-bold text-orange-400 mb-2">24/7</div>
              <p className="text-blue-100">Support Available</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">Popular Routes</h3>
            <p className="text-gray-600 text-lg">Frequently traveled destinations</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-lg text-blue-900">Dhaka → Chittagong</h4>
              </div>
              <p className="text-gray-600 mb-4">Most popular intercity route</p>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-orange-500" />
                <h4 className="font-bold text-lg text-blue-900">Dhaka → Sylhet</h4>
              </div>
              <p className="text-gray-600 mb-4">Scenic northeastern journey</p>
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <MapPin className="w-5 h-5 text-blue-600" />
                <h4 className="font-bold text-lg text-blue-900">Dhaka → Rajshahi</h4>
              </div>
              <p className="text-gray-600 mb-4">Western route convenience</p>
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                <span>Book Now</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-blue-900 mb-3">What Travelers Say</h3>
            <p className="text-gray-600 text-lg">Real experiences from real customers</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />)}
              </div>
              <p className="text-gray-700 mb-4">"Super easy to use! Booked my tickets in less than a minute. The QR code feature is brilliant!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  AH
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Ahmed Hassan</p>
                  <p className="text-sm text-gray-600">Regular Commuter</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />)}
              </div>
              <p className="text-gray-700 mb-4">"Finally a reliable railway booking system. Real-time seat updates saved me so much time!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                  FK
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Fatima Khan</p>
                  <p className="text-sm text-gray-600">Business Traveler</p>
                </div>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
              <div className="flex mb-3">
                {[1,2,3,4,5].map(i => <Star key={i} className="w-5 h-5 fill-orange-500 text-orange-500" />)}
              </div>
              <p className="text-gray-700 mb-4">"Payment is super secure and I got instant confirmation. Best railway booking experience ever!"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                  RI
                </div>
                <div>
                  <p className="font-semibold text-blue-900">Rahim Islam</p>
                  <p className="text-sm text-gray-600">Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-4xl md:text-5xl font-bold mb-4">Ready to Start Your Journey?</h3>
          <p className="text-xl text-orange-100 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied travelers who book their train tickets with Jatra Railway
          </p>
          <Link href="/signup">
            <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 text-lg px-10 h-14 rounded-xl font-semibold">
              <Users className="w-5 h-5" />
              <span>Create Free Account</span>
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                  <Train className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold">Jatra Railway</h3>
              </div>
              <p className="text-blue-200 text-sm">
                Modern, secure, and reliable train ticket booking for Bangladesh Railway
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-3">Quick Links</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><Link href="/dashboard" className="hover:text-orange-400 transition-colors">Search Trains</Link></li>
                <li><Link href="/login" className="hover:text-orange-400 transition-colors">My Bookings</Link></li>
                <li><Link href="/signup" className="hover:text-orange-400 transition-colors">Create Account</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Support</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Contact Us</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-3">Legal</h4>
              <ul className="space-y-2 text-blue-200 text-sm">
                <li><a href="#" className="hover:text-orange-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-orange-400 transition-colors">Refund Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 text-center text-blue-200 text-sm">
            <p>&copy; 2025 Jatra Railway. Built with ❤️ for Bangladesh Railway</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
