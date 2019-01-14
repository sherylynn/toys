using System;
using System.IO;
using System.Text;
namespace testhelper
{
  class Program
  {
    static string fuckTestHelper(string serial_code)
    {
      string text = serial_code;
      string text3 = "";
      int i = 1;
      ASCIIEncoding asciiencoding = new ASCIIEncoding();
      while (i < text.Length)
      {
        string s = text.Substring(i - 1, 1);
        int num = (int)(asciiencoding.GetBytes(s)[0] * 2) + i;
        text3 = text3 + i.ToString() + num.ToString();
        i++;
      }
      string text4 = "788";
      /*
      111 只有知识点分析 灰试题
      122 只有真题回忆  灰试题
      233 报错但是都能用
      344 只有模拟试题
      579 有知识点 真题 灰试题
      670 报anli不存在，其他都在
      788 三个都有，正常版
       */
      
      return text3.Substring(3, 20) + text4 + text3.Substring(text3.Length - 5, 5);
    }
    /*
    private string regCode(){
      Hardware.HardwareInfo hardwareInfo = new Hardware.HardwareInfo();
      string cpuID = hardwareInfo.GetCpuID();
      string hardDiskID = hardwareInfo.GetHardDiskID();
      return cpuID.Substring(cpuID.Length - 5, 5) + hardDiskID;
    }
    */
    static void Main()
    {
      TextReader tIn =Console.In;
      TextWriter tOut=Console.Out;
      tOut.Write("输入你的序列号：");
      string serial_code = tIn.ReadLine();
      string regCodeId = fuckTestHelper(serial_code);
      Console.WriteLine("regCode is {0}",regCodeId );
    }
  }
}
