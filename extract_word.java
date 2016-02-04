import java.io.*;

public class extract_word
{
	public static void main(String[] args){
		String file = args[0];
		try{
			BufferedReader br = new BufferedReader(new FileReader(file));
			String line = "";
			while((line = br.readLine()) != null){
				String[] words = line.split(" ");
				String word = "";
				if(words[0].length() > 1){
					word = words[0];
				}
				else if (words[0].equals("h"))
					continue;
				else 
					word = words[1];
				for(int i = 1; i < word.length(); i++){
					char c = word.charAt(i);
					//System.out.println(c);
					if(c < 'a' || c > 'z'){
						word = word.substring(0, i);
						break;
					}
				}
				System.out.println(word);
			}
		}
		catch(Exception e){
			e.printStackTrace();
		}
	}

}