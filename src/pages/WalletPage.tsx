import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  TrendingUp,
  AlertCircle,
  X
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { apiClient } from '../services/api/client';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Transaction {
  id: string;
  amount: string;
  transaction_type: 'credit' | 'debit';
  description: string;
  created_at: string;
}

interface WalletData {
  balance: string;
  currency: string;
  is_frozen: boolean;
}

const WalletPage: React.FC = () => {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Withdrawal modal
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMobile, setWithdrawMobile] = useState('');
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const fetchWalletData = async () => {
    try {
      const [walletRes, transRes] = await Promise.all([
        apiClient.get('/payments/wallet/balance/'),
        apiClient.get('/payments/wallet/transactions/')
      ]);
      setWallet(walletRes.data);
      setTransactions(transRes.data.results || transRes.data);
    } catch (err) {
      console.error('Failed to fetch wallet data', err);
      toast.error('تعذّر تحميل بيانات المحفظة');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWalletData();
  }, []);

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount);

    if (!withdrawAmount || isNaN(amount) || amount <= 0) {
      toast.error('يرجى إدخال مبلغ صحيح');
      return;
    }
    if (amount < 100) {
      toast.error('الحد الأدنى للسحب هو 100 جنيه');
      return;
    }
    if (!withdrawMobile.trim()) {
      toast.error('يرجى إدخال رقم المحفظة');
      return;
    }

    setWithdrawLoading(true);
    try {
      const res = await apiClient.post('/payments/wallet/withdraw/', {
        amount,
        mobile_number: withdrawMobile.trim(),
      });
      toast.success(res.data.detail || 'تم طلب السحب بنجاح');
      setShowWithdrawModal(false);
      setWithdrawAmount('');
      setWithdrawMobile('');
      // Refresh wallet data
      await fetchWalletData();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'حدث خطأ أثناء طلب السحب';
      toast.error(msg);
    } finally {
      setWithdrawLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const balance = parseFloat(wallet?.balance || '0');
  const currency = wallet?.currency || 'EGP';

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Wallet className="w-6 h-6 text-blue-600" />
            محفظتي
          </h1>
          <p className="text-gray-500 mt-1">تتبع أرباحك ومدفوعاتك بكل سهولة</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Balance Card */}
          <Card className="md:col-span-2 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 text-white border-none shadow-xl">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-blue-100 text-sm font-medium">الرصيد المتاح</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold">{balance.toFixed(2)}</span>
                  <span className="text-lg font-medium">{currency}</span>
                </div>
              </div>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button
                className="bg-white text-blue-700 hover:bg-blue-50 flex-1 font-semibold"
                onClick={() => {
                  if (wallet?.is_frozen) {
                    toast.error('محفظتك مجمدة. يرجى التواصل مع الدعم.');
                    return;
                  }
                  setShowWithdrawModal(true);
                }}
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                سحب الرصيد
              </Button>
            </div>
          </Card>

          {/* Quick Info */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600" />
              تنبيهات
            </h3>
            <div className="space-y-4">
              <div className="text-sm text-gray-600">
                {wallet?.is_frozen 
                  ? '⚠️ محفظتك مجمدة حاليا. يرجى التواصل مع الدعم.'
                  : '✅ رصيدك متاح للسحب في أي وقت (الحد الأدنى للسحب 100 جنيه).'}
              </div>
              <div className="text-sm text-gray-500">
                يتم تحويل المبالغ المسحوبة خلال 24 ساعة عمل إلى محفظة فودافون كاش.
              </div>
            </div>
          </Card>
        </div>

        {/* Transactions History */}
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <History className="w-5 h-5 text-gray-400" />
              سجل المعاملات
            </h3>
          </div>
          <div className="divide-y divide-gray-100">
            {transactions.length > 0 ? (
              transactions.map((tx) => (
                <div key={tx.id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${
                      tx.transaction_type === 'credit' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-red-100 text-red-600'
                    }`}>
                      {tx.transaction_type === 'credit' 
                        ? <ArrowDownLeft className="w-5 h-5" /> 
                        : <ArrowUpRight className="w-5 h-5" />
                      }
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{tx.description}</p>
                      <p className="text-xs text-gray-500">
                        {tx.created_at ? format(new Date(tx.created_at), 'PPP p', { locale: ar }) : ''}
                      </p>
                    </div>
                  </div>
                  <div className={`text-lg font-bold ${
                    tx.transaction_type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {tx.transaction_type === 'credit' ? '+' : '-'}{tx.amount}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-gray-400">
                لاتوجد معاملات حاليا
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Withdrawal Modal */}
      <Modal
        isOpen={showWithdrawModal}
        onClose={() => {
          setShowWithdrawModal(false);
          setWithdrawAmount('');
          setWithdrawMobile('');
        }}
        title="سحب الرصيد"
        size="sm"
      >
        <div className="space-y-5">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            الرصيد المتاح: <strong>{balance.toFixed(2)} {currency}</strong>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              المبلغ المراد سحبه (JE) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              min="100"
              max={balance}
              step="1"
              placeholder="الحد الأدنى 100 جنيه"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              رقم محفظة فودافون كاش <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              placeholder="01xxxxxxxxx"
              value={withdrawMobile}
              onChange={(e) => setWithdrawMobile(e.target.value)}
            />
            <p className="text-xs text-gray-500 mt-1">سيتم إرسال المبلغ إلى هذا الرقم خلال 24 ساعة</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setShowWithdrawModal(false);
                setWithdrawAmount('');
                setWithdrawMobile('');
              }}
            >
              إلغاء
            </Button>
            <Button
              className="flex-1"
              isLoading={withdrawLoading}
              onClick={handleWithdraw}
            >
              تأكيد السحب
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WalletPage;
