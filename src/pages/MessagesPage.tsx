import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { 
  MessageCircle, 
  Send, 
  Paperclip, 
  MoreVertical,
  Search,
  Archive,
  Flag
} from 'lucide-react';

import { RootState } from '../store/store';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { useDirection } from '../hooks/useDirection';

interface Conversation {
  id: string;
  service: {
    title_ar: string;
    slug: string;
  };
  other_user: {
    full_name: string;
    avatar?: string;
    is_online: boolean;
  };
  last_message: {
    content: string;
    created_at: string;
    sender_id: string;
  };
  unread_count: number;
  is_archived: boolean;
}

interface Message {
  id: string;
  sender: {
    id: string;
    full_name: string;
    avatar?: string;
  };
  content: string;
  message_type: 'text' | 'image' | 'file' | 'system';
  attachment?: string;
  is_read: boolean;
  created_at: string;
}

const MessagesPage: React.FC = () => {
  const { t } = useTranslation();
  const { isRTL } = useDirection();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
   const API_BASE =
  (import.meta.env?.VITE_API_BASE || "http://192.168.1.7:8000") ;
  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id);
    }
  }, [selectedConversation]);

  const loadConversations = async () => {
    try {
      const response = await fetch(API_BASE+'/api/v1/messages/conversations/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.results);
        return;
      }
      
      console.error('Failed to load conversations:', response.statusText);
      
    } catch (error) {
      console.error('Failed to load conversations:', error);
    }
  };

  const loadMessages = async (conversationId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/v1/messages/conversations/${conversationId}/messages/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.results);
        return;
      }
      
      console.error('Failed to load messages:', response.statusText);
      
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      // API call to send message
      const response = await fetch(`/api/v1/messages/messages/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          conversation: selectedConversation.id,
          content: newMessage,
          message_type: 'text',
        }),
      });

      if (response.ok) {
        setNewMessage('');
        loadMessages(selectedConversation.id); // Refresh messages
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.other_user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.service.title_ar.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-6 h-[calc(100vh-12rem)]">
          {/* Conversations Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-full flex flex-col !p-0">
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {t('messages.conversations')}
                </h2>
                <Input
                  placeholder={t('messages.search')}
                  leftIcon={<Search className="w-4 h-4" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                {filteredConversations.length === 0 ? (
                  <div className="text-center py-12">
                    <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">{t('messages.noConversations')}</p>
                  </div>
                ) : (
                  <div className="space-y-1 p-2">
                    {filteredConversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => setSelectedConversation(conversation)}
                        className={`w-full p-4 text-right rounded-lg transition-colors ${
                          selectedConversation?.id === conversation.id
                            ? 'bg-primary-50 border-primary-200'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 rtl:space-x-reverse">
                          <div className="relative">
                            {conversation.other_user.avatar ? (
                              <img
                                src={conversation.other_user.avatar}
                                alt={conversation.other_user.full_name}
                                className="w-12 h-12 rounded-full"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center">
                                <span className="text-white font-medium">
                                  {conversation.other_user.full_name.charAt(0)}
                                </span>
                              </div>
                            )}
                            {conversation.other_user.is_online && (
                              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-medium text-gray-900 truncate">
                                {conversation.other_user.full_name}
                              </p>
                              {conversation.unread_count > 0 && (
                                <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-1 min-w-[1.25rem] h-5 flex items-center justify-center">
                                  {conversation.unread_count}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 truncate mb-1">
                              {conversation.service.title_ar}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {conversation.last_message.content}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Chat Area */}
          <div className="lg:col-span-3">
            {selectedConversation ? (
              <Card className="h-full flex flex-col !p-0">
                {/* Chat Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                      {selectedConversation.other_user.avatar ? (
                        <img
                          src={selectedConversation.other_user.avatar}
                          alt={selectedConversation.other_user.full_name}
                          className="w-10 h-10 rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                          <span className="text-white font-medium">
                            {selectedConversation.other_user.full_name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {selectedConversation.other_user.full_name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {selectedConversation.service.title_ar}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 rtl:space-x-reverse">
                      <Button variant="ghost" size="sm">
                        <Archive className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Flag className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {isLoading ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" />
                    </div>
                  ) : (
                    messages.map((message) => {
                      const isOwnMessage = message.sender.id === user?.id;
                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                        >
                          <div className={`max-w-xs lg:max-w-md ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                            <div
                              className={`px-4 py-2 rounded-lg ${
                                isOwnMessage
                                  ? 'bg-primary-600 text-white'
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              <p className="text-sm">{message.content}</p>
                            </div>
                            <p className={`text-xs text-gray-500 mt-1 ${isOwnMessage ? 'text-left' : 'text-right'}`}>
                              {new Date(message.created_at).toLocaleTimeString('ar-EG', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>
                          
                          {!isOwnMessage && (
                            <div className="order-1 mr-2 rtl:mr-0 rtl:ml-2">
                              {message.sender.avatar ? (
                                <img
                                  src={message.sender.avatar}
                                  alt={message.sender.full_name}
                                  className="w-8 h-8 rounded-full"
                                />
                              ) : (
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                                  <span className="text-gray-600 text-xs font-medium">
                                    {message.sender.full_name.charAt(0)}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Message Input */}
                <div className="p-6 border-t border-gray-200">
                  <div className="flex items-center space-x-4 rtl:space-x-reverse">
                    <Button variant="ghost" size="sm">
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    
                    <div className="flex-1">
                      <Input
                        placeholder={t('messages.typeMessage')}
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendMessage();
                          }
                        }}
                      />
                    </div>
                    
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      leftIcon={<Send className="w-4 h-4" />}
                    >
                      {t('messages.send')}
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <div className="text-center">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    اختر محادثة
                  </h3>
                  <p className="text-gray-500">
                    اختر محادثة من القائمة لبدء المراسلة
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;