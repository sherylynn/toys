using System;
using System.IO;
using System.Text;
using LitJson;

namespace json
{
    class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
        public DateTime Birthday { get; set; }
    }
    static class PackageManager
    {
        static public string path = Directory.GetCurrentDirectory();
        static public string jsonDir = Path.Combine(path,"../../json/test.json");
    }
    class Package
    {
        public string name ;
        public string version ;
        public string url;
    }
    class Program
    {
        static Person JsonToPerson()
        {
            string json = @"
                {
                    ""Name"" :""lynn"",
                    ""Age"":26,
                    ""Birthday"":""04/24/1992 00:00:00""
                }";
            Person lynn = JsonMapper.ToObject<Person>(json);
            return lynn;
        }
        static string JsonFromFile()
        {   
            string json_string = File.ReadAllText(PackageManager.jsonDir);
            Package test_json = JsonMapper.ToObject<Package>(json_string);
            return test_json.url;
        }
        static void Main(string[] args)
        {
            Person lynn = new Person
            {
                Name = "sherylynn",
                Age = 26,
                Birthday = new DateTime(1992, 4, 24)
            };
            string json_lynn = JsonMapper.ToJson(lynn);
            Console.WriteLine(json_lynn);
            Console.WriteLine(JsonToPerson().Age);
            Console.WriteLine(JsonFromFile());
        }
    }
}
