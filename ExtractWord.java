import java.io.*;
import java.util.regex.*;
import java.util.*;

/**
This File Extracts the word and its POS from a given file
*/
public class ExtractWord
{
	public static void main(String[] args){
		HashSet<String> pos = new HashSet<String>();
		pos.add("V.");
		pos.add("N.");
		pos.add("ADJ.");
		pos.add("V.,");
		pos.add("N.,");
		pos.add("ADJ.,");
		String file = args[0];
		try{
			BufferedReader br = new BufferedReader(new FileReader(file));
			String line = "";
			while((line = br.readLine()) != null){
				line = line.trim();
				// System.out.println(line);
				String[] words = line.split("\\s+");
				if(words.length < 3)
					continue;
				if(Character.isUpperCase(words[0].charAt(0)))
					continue;
				// System.out.println("words: " + words[1]);
				if(! pos.contains(words[1]))
					continue;
				String word = words[0];
				System.out.print(word + " ");
				String p1 = words[1];
				if(p1.endsWith(",")){
					p1 = p1.substring(0, p1.length() - 1); 
					System.out.print(p1 + " ");
					System.out.println(words[2]);
				}
				else
					System.out.println(p1);
			}
		}
		catch(Exception e){
			e.printStackTrace();
		}
	}

}