import org.jsoup.Jsoup;
import org.jsoup.helper.Validate;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;

import org.json.simple.JSONObject;
import org.json.simple.JSONArray;

import com.google.gson.Gson;

import java.io.*;
import java.util.*;

/**
This class searches for the synonym of a word and writes the result to a json.
*/

public class FindSyn{
	
	static HashMap<String, ArrayList<String>> map = new HashMap<String, ArrayList<String>>();

	public static void main(String[] args) throws Exception{
		BufferedReader br = new BufferedReader(new FileReader("words"));
		String line;

		int count = 0;
		while((line = br.readLine()) != null){
			findSyn(line);
			// count++;
			// if(count == 10)
				// break;
		}


		Gson gson = new Gson(); 
		String json = gson.toJson(map); 

		PrintWriter pw = new PrintWriter(new File("syn.json"));
		pw.println(json);
		pw.close();

	}

	public static String findPOS(Document doc){
		Element l = doc.select(".synonym-description").first();
		Element pos = doc.select(".txt").first();
		String p = pos.text();
		return p;
	}

	public static void findSyn(String str) throws Exception{
		String[] line = str.split(" ");
		String w = line[0];
		System.out.println(w);
		String url = String.format("http://www.thesaurus.com/browse/%s?s=t", w);
		Document doc;
		try{
			doc = Jsoup.connect(url).get();
		}
		catch(Exception e){
			System.out.println("word has no def: " + w);
			return;
		}
		Element l = doc.select(".relevancy-list").first();
		if(l == null){
			System.out.println("null list: " + w);
			return;
		}
		String pos = findPOS(doc);
		Elements words = l.select("[data-category*='relevant-3']");
		// Elements words = l.select("li");
		for(Element e: words){
			String text = e.text();
			text = text.substring(0, text.length() - 4);
			ArrayList<String> syn;
			String key = text + " " + pos;
			if(text.equals(w))
				continue;
			if(map.containsKey(key))
				syn = map.get(key);		
			else
				syn = new ArrayList<String>();
			syn.add(w);
			// System.out.println("key: " + key + "\tsyn: "+ syn);
			map.put(key, syn);
		}
		return;
	}

}