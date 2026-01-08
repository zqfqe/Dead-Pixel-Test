import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface TestResult {
  testId: string;
  testName: string;
  status: 'pass' | 'fail' | 'skipped';
  notes?: string;
  timestamp: number;
}

interface TestReportContextType {
  results: TestResult[];
  addResult: (result: TestResult) => void;
  clearResults: () => void;
  getReportScore: () => number;
}

const TestReportContext = createContext<TestReportContextType | undefined>(undefined);

const STORAGE_KEY = 'deadpixeltest-report-v1';

export const TestReportProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [results, setResults] = useState<TestResult[]>(() => {
    try {
      const item = window.localStorage.getItem(STORAGE_KEY);
      return item ? JSON.parse(item) : [];
    } catch (e) {
      return [];
    }
  });

  // Persist whenever results change
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(results));
    } catch (e) {
      console.error("Failed to save report to local storage");
    }
  }, [results]);

  const addResult = (result: TestResult) => {
    setResults(prev => {
      // Remove existing result for this testId if exists, then add new
      const filtered = prev.filter(r => r.testId !== result.testId);
      return [...filtered, result];
    });
  };

  const clearResults = () => setResults([]);

  const getReportScore = () => {
    if (results.length === 0) return 0;
    const passed = results.filter(r => r.status === 'pass').length;
    return Math.round((passed / results.length) * 100);
  };

  return (
    <TestReportContext.Provider value={{ results, addResult, clearResults, getReportScore }}>
      {children}
    </TestReportContext.Provider>
  );
};

export const useTestReport = () => {
  const context = useContext(TestReportContext);
  if (!context) {
    throw new Error('useTestReport must be used within a TestReportProvider');
  }
  return context;
};