import React from 'react';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">منصة الخدمات المصرية</h3>
            <p className="text-gray-300 text-sm">
              منصة موثوقة لربط مقدمي الخدمات بالعملاء في جميع أنحاء مصر
            </p>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">روابط مهمة</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">شروط الاستخدام</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">سياسة الخصوصية</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">اتصل بنا</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-md font-semibold mb-4">معلومات التواصل</h4>
            <div className="text-sm text-gray-300">
              <p>البريد الإلكتروني:bashertoop88888@gmail.com</p>
              <p>الهاتف: 01122411136</p>
              <p>تواصل واتساب : 01102585141</p>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-4 text-center text-sm text-gray-300">
          © 2024 منصة الخدمات المصرية. جميع الحقوق محفوظة.
        </div>
      </div>
    </footer>
  );
}