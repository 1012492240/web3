'use client';

import { useState, useEffect } from 'react';
import { runAllTests, testScenario } from '@/app/api/test/community/test-client';
import { COMMUNITY_TYPE, GROUP_TYPE, NORMAL_TYPE } from '@/constants';
import type { MembershipType } from '@/constants';

// 定义测试场景说明
const scenarioDescriptions: Record<string, string> = {
  'invalid_transaction': '无效交易 - 缺少交易哈希',
  'no_from_address': '缺少发送地址 - 无法确定交易发送者',
  'no_type': '缺少类型 - 无法确定社区类型',
  'insufficient_balance': '余额不足 - 用户余额不足以完成交易',
  'wrong_destination': '错误目标地址 - 转账目标地址不正确',
  'non_usdt': '非USDT代币 - 使用了非USDT代币',
  'invalid_amount': '金额不匹配 - 金额与会员类型不符',
  'success': '成功场景 - 正常交易流程'
};

export default function TestCommunityPage() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedScenario, setSelectedScenario] = useState('invalid_transaction');
  const [selectedType, setSelectedType] = useState<MembershipType>(COMMUNITY_TYPE);
  const [selectedResult, setSelectedResult] = useState<any>(null);

  const runTests = async () => {
    setLoading(true);
    try {
      const testResults = await runAllTests();
      setResults(testResults);
    } catch (error) {
      console.error('测试运行出错:', error);
    } finally {
      setLoading(false);
    }
  };

  const runSingleTest = async () => {
    setLoading(true);
    try {
      const result = await testScenario(selectedScenario, selectedType);
      setSelectedResult(result);
    } catch (error) {
      console.error('单个测试运行出错:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl bg-gray-100">
      <h1 className="text-3xl font-bold mb-6 text-blue-700">社区API测试</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">运行所有测试</h2>
          <p className="mb-4 text-gray-700">这将测试所有错误场景和会员类型的组合</p>
          <button 
            onClick={runTests}
            disabled={loading}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg text-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '测试运行中...' : '运行所有测试'}
          </button>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">运行单个测试</h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">测试场景:</label>
            <select 
              value={selectedScenario}
              onChange={(e) => setSelectedScenario(e.target.value)}
              className="w-full p-2 border border-gray-400 rounded bg-white text-gray-800"
            >
              {Object.keys(scenarioDescriptions).map(scenario => (
                <option key={scenario} value={scenario}>
                  {scenarioDescriptions[scenario]}
                </option>
              ))}
            </select>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">会员类型:</label>
            <select 
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as MembershipType)}
              className="w-full p-2 border border-gray-400 rounded bg-white text-gray-800"
            >
              <option value={COMMUNITY_TYPE}>社区 (COMMUNITY)</option>
              <option value={GROUP_TYPE}>小组 (GROUP)</option>
              <option value={NORMAL_TYPE}>普通 (NORMAL)</option>
            </select>
          </div>
          
          <button 
            onClick={runSingleTest}
            disabled={loading}
            className="w-full px-6 py-3 bg-green-600 text-white rounded-lg text-lg font-medium hover:bg-green-700 disabled:bg-gray-400 transition-colors"
          >
            {loading ? '测试运行中...' : '运行单个测试'}
          </button>
        </div>
      </div>
      
      {/* 单个测试结果显示 */}
      {selectedResult && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md border border-gray-200">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">单个测试结果</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-800">请求参数</h3>
              <div className="bg-gray-800 text-green-300 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
                {selectedResult.response && selectedResult.response.request ? (
                  <pre>{JSON.stringify(selectedResult.response.request, null, 2)}</pre>
                ) : (
                  <p className="text-yellow-300">无请求参数</p>
                )}
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-2 text-gray-800">响应结果</h3>
              <div className="bg-gray-800 text-green-300 p-4 rounded-md font-mono text-sm overflow-x-auto shadow-inner">
                {selectedResult.response ? (
                  <pre>{JSON.stringify(selectedResult.response.response, null, 2)}</pre>
                ) : (
                  <p className="text-yellow-300">无响应数据</p>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-lg font-medium mb-2 text-gray-800">状态码</h3>
            <span className={`px-4 py-2 rounded-md text-white text-lg font-bold ${selectedResult.status < 400 ? 'bg-green-600' : 'bg-red-600'}`}>
              {selectedResult.status}
            </span>
            <span className="ml-4 text-gray-700">
              {selectedResult.status < 400 ? '请求成功' : '请求失败'}
            </span>
          </div>
        </div>
      )}
      
      {/* 所有测试结果表格 */}
      {results.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">所有测试结果</h2>
          
          <div className="overflow-x-auto shadow-lg rounded-lg">
            <table className="min-w-full bg-white border-collapse">
              <thead>
                <tr className="bg-gray-800 text-white">
                  <th className="px-6 py-3 text-left text-lg font-semibold">场景</th>
                  <th className="px-6 py-3 text-left text-lg font-semibold">描述</th>
                  <th className="px-6 py-3 text-left text-lg font-semibold">类型</th>
                  <th className="px-6 py-3 text-left text-lg font-semibold">状态码</th>
                  <th className="px-6 py-3 text-left text-lg font-semibold">响应</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((result, index) => {
                  // 确定行的样式
                  const isSuccess = result.status < 400 && !result.error;
                  const rowClass = isSuccess 
                    ? 'bg-green-50 hover:bg-green-100' 
                    : 'bg-red-50 hover:bg-red-100';
                  
                  // 格式化响应内容
                  let responseContent = '';
                  if (result.error) {
                    responseContent = `错误: ${result.error}`;
                  } else if (result.response) {
                    try {
                      // 尝试美化显示响应内容
                      const responseObj = result.response.response || result.response;
                      if (responseObj.error) {
                        responseContent = `错误: ${responseObj.error}`;
                      } else if (responseObj.success) {
                        responseContent = '成功: 操作完成';
                      } else {
                        responseContent = JSON.stringify(responseObj, null, 2).substring(0, 100);
                        if (responseContent.length >= 100) responseContent += '...';
                      }
                    } catch (e) {
                      responseContent = JSON.stringify(result.response).substring(0, 100);
                      if (responseContent.length >= 100) responseContent += '...';
                    }
                  } else {
                    responseContent = '无响应';
                  }
                  
                  return (
                    <tr key={index} className={rowClass}>
                      <td className="px-6 py-4 text-gray-900 font-medium">{result.scenario}</td>
                      <td className="px-6 py-4 text-gray-900">{scenarioDescriptions[result.scenario] || '未知场景'}</td>
                      <td className="px-6 py-4 text-gray-900">{result.type}</td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-white font-bold ${result.status < 400 ? 'bg-green-600' : 'bg-red-600'}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono text-sm whitespace-pre-wrap break-words max-w-md text-gray-900">
                        {responseContent}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">测试统计</h3>
            <div className="flex gap-6">
              <div className="bg-green-100 p-4 rounded-lg flex-1 border border-green-200">
                <p className="text-lg font-medium text-green-800">成功测试</p>
                <p className="text-3xl font-bold text-green-600">{results.filter(r => r.status < 400 && !r.error).length}</p>
              </div>
              <div className="bg-red-100 p-4 rounded-lg flex-1 border border-red-200">
                <p className="text-lg font-medium text-red-800">失败测试</p>
                <p className="text-3xl font-bold text-red-600">{results.filter(r => r.status >= 400 || r.error).length}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
