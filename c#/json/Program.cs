using System;
using LitJson;

namespace json
{
    class Person
    {
        public string Name { get; set; }
        public int Age { get; set; }
        public DateTime Birthday { get; set; }
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
        }
    }
}
