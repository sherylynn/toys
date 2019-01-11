using System;
using System.Text;
using Hardware;
namespace testhelper
{
    class Program
    {
        private void fuckTestHelper()
		{
			string text = this.textBox1.Text;
			string text2 = this.textBox2.Text;
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
			string text4 = text2.Substring(20, 3);
			string text5 = text4;
			switch (text5)
			{
			case "111":
			case "122":
			case "233":
			case "344":
			case "455":
			case "136":
			case "257":
			case "368":
			case "579":
			case "670":
			case "788":
				if (text2 == text3.Substring(3, 20) + text4 + text3.Substring(text3.Length - 5, 5))
				{
					OleDbConnection oleDbConnection = new OleDbConnection(this.string_0);
					oleDbConnection.Open();
					OleDbCommand oleDbCommand = oleDbConnection.CreateCommand();
					oleDbCommand.CommandText = string.Concat(new string[]
					{
						"insert into 失效 (检验,临床)values('",
						text,
						"','",
						text2,
						"')"
					});
					oleDbCommand.ExecuteNonQuery();
					this.fisrtFrm_0.label1.Text = "1";
					MessageBox.Show("注册成功,请重启程序!", "提示");
					OleDbCommand oleDbCommand2 = oleDbConnection.CreateCommand();
					text5 = text4;
					switch (text5)
					{
					case "111":
						oleDbCommand2.CommandText = "drop table test1,Ztest";
						oleDbCommand2.ExecuteNonQuery();
						break;
					case "122":
						oleDbCommand2.CommandText = "drop table test1,huizong";
						oleDbCommand2.ExecuteNonQuery();
						break;
					case "233":
						oleDbCommand2.CommandText = "drop table huizong,Ztest,anli";
						oleDbCommand2.ExecuteNonQuery();
						break;
					case "344":
						oleDbCommand2.CommandText = "drop table huizong,Ztest";
						oleDbCommand2.ExecuteNonQuery();
						break;
					case "455":
						oleDbCommand2.CommandText = "drop table Ztest,anli";
						oleDbCommand2.ExecuteNonQuery();
						break;
					case "136":
						oleDbCommand2.CommandText = "drop table Ztest";
						oleDbCommand2.ExecuteNonQuery();
						break;
					case "257":
						oleDbCommand2.CommandText = "drop table huizong,anli";
						oleDbCommand2.ExecuteNonQuery();
						break;
					case "368":
						oleDbCommand2.CommandText = "drop table huizong";
						oleDbCommand2.ExecuteNonQuery();
						break;
					case "579":
						oleDbCommand2.CommandText = "drop table test1";
						oleDbCommand2.ExecuteNonQuery();
						break;
					case "670":
						oleDbCommand2.CommandText = "drop table anli";
						oleDbCommand2.ExecuteNonQuery();
						break;
					}
					oleDbConnection.Close();
					base.Dispose();
					Application.Exit();
					return;
				}
				MessageBox.Show("您输入的注册码不正确", "提示", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
				return;
			}
			MessageBox.Show("您输入的注册码不正确", "提示", MessageBoxButtons.OK, MessageBoxIcon.Exclamation);
		}
        private string regCode(){
            Hardware.HardwareInfo hardwareInfo = new Hardware.HardwareInfo();
			string cpuID = hardwareInfo.GetCpuID();
			string hardDiskID = hardwareInfo.GetHardDiskID();
			return cpuID.Substring(cpuID.Length - 5, 5) + hardDiskID;
        }
        static void Main(string[] args)
        {
            string regCodeId = regCode()
            Console.WriteLine("regCode is {1}",regCodeId );
        }
        
    }
}
