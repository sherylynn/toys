using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
namespace TeleprompterConsole
{
    class Program
    {
        static void Main(string[] args)
        {
            ShowTeleprompter().Wait();
        }
        private static async Task ShowTeleprompter()
        {
            var words = ReadFrom("Program.cs");
            foreach (var word in words)
            {
                Console.Write(word);
                if(!string.IsNullOrWhiteSpace(word))
                {
                    await Task.Delay(200);
                }
            }
        }
        static IEnumerable<string> ReadFrom(string file)
        {
            string line;
            using (var reader = File.OpenText(file))
            {
                while((line=reader.ReadLine())!=null)
                {
                    var words = line.Split(' ');
                    var lineLength = 0;
                    foreach(var word in words)
                    {
                        yield return word + " ";
                        lineLength += word.Length + 1;
                        if(lineLength>70)
                        {
                            yield return Environment.NewLine;
                            lineLength = 0;
                        }
                    }
                    yield return Environment.NewLine;
                }
            }
        }
        private static async Task GetInput()
        {
            var delay = 200;
            Action work = () =>
             {
                 do
                 {
                     var key = Console.ReadKey(true);
                     if (key.KeyChar == '>')
                     {
                         delay -= 10;
                     }
                     else if (key.KeyChar == '<')
                     {
                         delay += 10;
                     }
                     else if (key.KeyChar == 'X' || key.KeyChar == 'x')
                     {
                         break;
                     }
                 } while (true);
             };
            await Task.Run(work);
        }
    }
}
