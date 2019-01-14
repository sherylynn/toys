using System;
using System.IO;

namespace copy
{
  class Program
  {
    static string FileName = @"winLanguage.dll";
    static string SourceDir = Path.GetFullPath(FileName);
    static string TargetDir = @"C:\Files";
    //static void Main(string[] args = ( FileName,SourceDir,TargetDir))
    static void Main(string[] args)
    {
      try
      {
        File.Copy(SourceDir,Path.Combine(TargetDir,FileName),true);
        Console.WriteLine("已经安装");
      }
      catch (IOException copyError)
      {
        Console.WriteLine(copyError.Message);
      }
      //Console.WriteLine("now directory name is {0}", SourceDir);
    }
  }
}
